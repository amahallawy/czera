<?php
// Reference copy of live Code Snippet ID 15 "CZERA order emails" on czeramaison.com (scope: global).
// The site database is authoritative; update both together. Added by amahallawy/czera#111; the CZERA layer for every other email by #115.

/**
 * CZERA order emails: WooCommerce's "New order" email (to the sales team) and its "Processing order"
 * and "Order on-hold" emails (to the customer) in the CZERA design approved on 2026-10-19 (mockup
 * order-emails.html in the czera repo's .superpowers folder, local only). Every other WooCommerce
 * email keeps its default look.
 *
 * How: WooCommerce's own templates still run (so its hooks, the preview in Settings > Emails and
 * other plugins keep working), but for these three emails everything they print between
 * woocommerce_email_header and woocommerce_email_footer is buffered and replaced by the CZERA
 * markup below: tables and inline styles, so Gmail, Apple Mail and Outlook all show it. WooCommerce's
 * email CSS is not applied to them.
 *
 * Content:
 * - Sales: "Call to confirm" bar with the customer's phone, "Deliver to", a pack list with tick
 *   boxes (a custom box is one line with its contents under it), "Money", and a link to the order.
 * - Customer: wordmark header, "Thank you", the items with photos (a custom box lists its contents
 *   on one line), totals, the delivery address and the support footer.
 * The delivery fee is 0 until the client decides a fee rule, so it reads "Quote on the call"
 * (sales) and "Confirmed on the call" (customer); a real fee shows as an amount.
 *
 * Every other WooCommerce email (cancelled, failed, completed, refunded, order details, customer
 * note, account and password emails) keeps WooCommerce's content and layout, dressed in the same
 * identity (amahallawy/czera#115): WooCommerce's own email settings carry the CZERA colours, the
 * wordmark (media 326) and the support footer, and czera_email_frame_css() below adds what those
 * settings can't: Montserrat, the ivory header band with its gold rule, the light 22px heading,
 * small gold section labels, boxed addresses and square corners.
 */

if ( ! function_exists( 'czera_email_kind' ) ) {
	/** 'sales' for New order, 'customer' for Processing / On-hold, '' for any other email. */
	function czera_email_kind( $email ) {
		if ( ! is_object( $email ) || empty( $email->id ) ) {
			return '';
		}
		if ( 'new_order' === $email->id ) {
			return 'sales';
		}
		if ( in_array( $email->id, [ 'customer_processing_order', 'customer_on_hold_order' ], true ) ) {
			return 'customer';
		}
		return '';
	}

	/** An amount as plain text, e.g. "1,940 EGP". */
	function czera_email_money( $amount, $order ) {
		$html = wc_price( $amount, [ 'currency' => $order->get_currency() ] );
		return trim( html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES, 'UTF-8' ) );
	}

	/** True for a WPC Composite Products component line (an item inside a custom box). */
	function czera_email_is_component( $item ) {
		foreach ( $item->get_meta_data() as $meta ) {
			if ( preg_match( '/^_?wooco_parent/', (string) $meta->key ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * The order's lines, with each custom box's components grouped under the box:
	 * [ [ 'item' => WC_Order_Item_Product, 'parts' => [ items ], 'total' => float ], ... ].
	 */
	function czera_email_lines( $order ) {
		$lines = [];
		$last  = null;
		foreach ( $order->get_items() as $item ) {
			if ( null !== $last && czera_email_is_component( $item ) ) {
				$lines[ $last ]['parts'][] = $item;
				$lines[ $last ]['total']  += (float) $item->get_total();
				continue;
			}
			$lines[] = [ 'item' => $item, 'parts' => [], 'total' => (float) $item->get_total() ];
			$last    = count( $lines ) - 1;
		}
		return $lines;
	}

	/** "2 × Bath Towel". A box's items carry the box's name in front ("Build your CZERA box → Bath
	 * Towel"), so they use the product's own name. */
	function czera_email_qty_name( $item ) {
		$product = $item->get_product();
		$name    = $product ? $product->get_name() : preg_replace( '/^.*(→|&rarr;)\s*/u', '', $item->get_name() );
		return $item->get_quantity() . ' × ' . $name;
	}

	/** A small product photo URL for the customer email (a box without a photo uses its first item's). */
	function czera_email_thumb( $line ) {
		$items = array_merge( [ $line['item'] ], $line['parts'] );
		foreach ( $items as $item ) {
			$product = $item->get_product();
			if ( $product && $product->get_image_id() ) {
				$url = wp_get_attachment_image_url( $product->get_image_id(), 'woocommerce_gallery_thumbnail' );
				if ( $url ) {
					return $url;
				}
			}
		}
		return '';
	}

	/** The delivery address as HTML lines (shipping address, or billing when there is none). */
	function czera_email_address( $order ) {
		$address = $order->has_shipping_address() ? $order->get_formatted_shipping_address() : $order->get_formatted_billing_address();
		return wp_kses( (string) $address, [ 'br' => [] ] );
	}

	/** The CZERA layer over WooCommerce's own email CSS, for every email not rendered above. */
	function czera_email_frame_css() {
		$font = "Montserrat,'Helvetica Neue',Arial,sans-serif";
		return '
#inner_wrapper, #template_container, #template_header { border-radius: 0 !important; }
#template_header_image { background-color: #F4F2EC !important; padding: 18px 24px !important; border-bottom: 2px solid #D8C28A !important; }
#template_header_image img { width: 80px !important; height: 34px !important; }
#header_wrapper { padding: 24px 24px 0 !important; }
#header_wrapper h1 { font-family: ' . $font . ' !important; font-size: 22px !important; font-weight: 300 !important; letter-spacing: -.01em !important; line-height: 1.3 !important; color: #010100 !important; text-align: left !important; }
#body_content_inner_cell { padding: 16px 24px 24px !important; }
#template_container td, #template_container th, #template_container p, #template_container div, #template_container span, #template_container a, #template_container address, #template_container h2, #template_container h3, #template_container table { font-family: ' . $font . ' !important; }
#body_content_inner { font-size: 14px !important; line-height: 1.5 !important; color: #2B2B2B !important; }
#body_content_inner h2 { font-size: 11px !important; letter-spacing: .12em !important; text-transform: uppercase !important; color: #8A5C12 !important; font-weight: 500 !important; line-height: 1.5 !important; margin: 20px 0 6px !important; }
#body_content_inner h3 { font-size: 14px !important; letter-spacing: 0 !important; text-transform: none !important; color: #2B2B2B !important; font-weight: 400 !important; line-height: 1.4 !important; }
#body_content_inner h2 span, #body_content_inner h2 time { font-size: 12px !important; letter-spacing: 0 !important; text-transform: none !important; color: #6B6B6B !important; font-weight: 400 !important; }
#body_content_inner a { color: #8A5C12 !important; }
#body_content_inner b.address-title, #body_content_inner tr.order-customer-note b { display: block !important; font-size: 11px !important; letter-spacing: .12em !important; text-transform: uppercase !important; color: #8A5C12 !important; font-weight: 500 !important; margin-bottom: 6px !important; }
.email-order-details th, .email-order-details td { color: #2B2B2B !important; border-bottom: 1px solid #F4F2EC !important; }
#addresses address { border: 1px solid #E7E1D5 !important; border-radius: 4px !important; padding: 12px 14px !important; line-height: 1.5 !important; word-break: normal !important; }
#credit { background-color: #F4F2EC !important; border-top: 0 !important; color: #6B6B6B !important; font-size: 12px !important; padding: 14px 24px !important; text-align: center !important; }
#credit a { color: #6B6B6B !important; }
';
	}

	/** The email's subject in CZERA wording. */
	function czera_email_subject( $kind, $order ) {
		if ( 'sales' === $kind ) {
			$city  = $order->get_shipping_city() ? $order->get_shipping_city() : $order->get_billing_city();
			$parts = array_filter( [
				'New order #' . $order->get_order_number(),
				$order->get_formatted_billing_full_name(),
				$city,
				czera_email_money( $order->get_total(), $order ),
			] );
			return implode( ' · ', $parts );
		}
		return sprintf( 'We’ve received your CZERA order (#%s)', $order->get_order_number() );
	}

	/** The full email document for $kind ('sales' or 'customer'). */
	function czera_email_render( $kind, $order ) {
		$font  = "Montserrat,'Helvetica Neue',Arial,sans-serif";
		$label = 'font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8A5C12;font-weight:500;padding:20px 0 6px;';
		$box   = 'border:1px solid #E7E1D5;border-radius:4px;';
		$cell  = 'padding:8px 14px;border-bottom:1px solid #F4F2EC;font-size:14px;color:#2B2B2B;vertical-align:top;';
		$right = $cell . 'text-align:right;white-space:nowrap;';
		$muted = 'color:#6B6B6B;font-size:12px;';
		$lines = czera_email_lines( $order );
		$money = function ( $amount ) use ( $order ) {
			return esc_html( czera_email_money( $amount, $order ) );
		};
		$fee   = (float) $order->get_shipping_total();
		$name  = $order->get_formatted_billing_full_name();
		$phone = $order->get_billing_phone();
		$note  = $order->get_customer_note();

		ob_start();
		?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo esc_html( czera_email_subject( $kind, $order ) ); ?></title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&amp;display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#E7E1D5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#E7E1D5;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;font-family:<?php echo esc_attr( $font ); ?>;color:#2B2B2B;font-size:14px;line-height:1.5;">
		<?php if ( 'customer' === $kind ) : ?>
<tr><td align="center" style="background:#F4F2EC;padding:18px 24px;border-bottom:2px solid #D8C28A;">
<img src="<?php echo esc_url( wp_get_attachment_image_url( 326, 'full' ) ); ?>" width="80" height="34" alt="CZERA" style="display:block;width:80px;height:34px;border:0;">
</td></tr>
		<?php endif; ?>
<tr><td style="padding:24px;">
		<?php if ( 'sales' === $kind ) : ?>
<h1 style="margin:0 0 4px;font-family:<?php echo esc_attr( $font ); ?>;font-weight:300;font-size:22px;letter-spacing:-.01em;color:#010100;">New order #<?php echo esc_html( $order->get_order_number() ); ?></h1>
<div style="<?php echo esc_attr( $muted ); ?>"><?php echo esc_html( wc_format_datetime( $order->get_date_created(), 'l j F Y, H:i' ) ); ?></div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;background:#2B2B2B;border-radius:4px;">
<tr>
<td style="padding:14px 16px;color:#F4F2EC;">
<div style="font-size:12px;color:#C9C6BE;">Call to confirm</div>
<div style="font-size:18px;font-weight:500;letter-spacing:.02em;color:#F4F2EC;"><?php echo esc_html( trim( $name . ( $phone ? ' · ' . $phone : '' ) ) ); ?></div>
</td>
			<?php if ( $phone ) : ?>
<td align="right" style="padding:14px 16px;">
<a href="<?php echo esc_url( 'tel:' . preg_replace( '/[^0-9+]/', '', $phone ) ); ?>" style="display:inline-block;background:#D4AF36;color:#010100;padding:8px 14px;border-radius:3px;font-weight:500;font-size:13px;text-decoration:none;white-space:nowrap;">Call</a>
</td>
			<?php endif; ?>
</tr>
</table>

<div style="<?php echo esc_attr( $label ); ?>">Deliver to</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="<?php echo esc_attr( $box ); ?>">
<tr><td style="padding:12px 14px;font-size:14px;color:#2B2B2B;">
<?php echo czera_email_address( $order ); // phpcs:ignore WordPress.Security.EscapeOutput -- wp_kses, <br> only. ?>
			<?php if ( $note ) : ?>
<div style="margin-top:8px;font-size:13px;"><b>Note:</b> <?php echo esc_html( $note ); ?></div>
			<?php endif; ?>
</td></tr>
</table>

<div style="<?php echo esc_attr( $label ); ?>">Pack list</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="<?php echo esc_attr( $box ); ?>">
			<?php foreach ( $lines as $line ) : ?>
				<?php $has_parts = ! empty( $line['parts'] ); ?>
<tr>
<td style="<?php echo esc_attr( $cell . ( $has_parts ? 'border-bottom:0;' : '' ) ); ?>"><span style="color:#A3A099;">&#9744;</span>&nbsp; <span style="color:#8A5C12;font-weight:500;"><?php echo esc_html( $line['item']->get_quantity() ); ?> ×</span> <?php echo $has_parts ? '<b>' . esc_html( $line['item']->get_name() ) . '</b>' : esc_html( $line['item']->get_name() ); ?></td>
<td style="<?php echo esc_attr( $right . ( $has_parts ? 'border-bottom:0;' : '' ) ); ?>"><?php echo $money( $line['total'] ); ?></td>
</tr>
				<?php if ( $has_parts ) : ?>
<tr><td colspan="2" style="padding:0 14px 8px 52px;border-bottom:1px solid #F4F2EC;font-size:13px;color:#6B6B6B;">
					<?php foreach ( $line['parts'] as $part ) : ?>
<div style="padding:2px 0;"><span style="color:#A3A099;">&#9744;</span>&nbsp; <?php echo esc_html( czera_email_qty_name( $part ) ); ?></div>
					<?php endforeach; ?>
</td></tr>
				<?php endif; ?>
			<?php endforeach; ?>
</table>

<div style="<?php echo esc_attr( $label ); ?>">Money</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="<?php echo esc_attr( $box ); ?>">
<tr><td style="<?php echo esc_attr( $cell ); ?>">Items</td><td style="<?php echo esc_attr( $right ); ?>"><?php echo $money( $order->get_subtotal() ); ?></td></tr>
<tr><td style="<?php echo esc_attr( $cell ); ?>">Delivery</td><td style="<?php echo esc_attr( $right . ( $fee > 0 ? '' : 'color:#6B6B6B;' ) ); ?>"><?php echo $fee > 0 ? $money( $fee ) : 'Quote on the call'; ?></td></tr>
<tr><td style="<?php echo esc_attr( $cell ); ?>">Payment</td><td style="<?php echo esc_attr( $right ); ?>"><?php echo esc_html( $order->get_payment_method_title() ); ?></td></tr>
<tr><td style="<?php echo esc_attr( $cell . 'border-bottom:0;font-size:16px;font-weight:500;color:#010100;' ); ?>">To collect</td><td style="<?php echo esc_attr( $right . 'border-bottom:0;font-size:16px;font-weight:500;color:#010100;' ); ?>"><?php echo $money( $order->get_total() ) . ( $fee > 0 ? '' : ' + delivery' ); ?></td></tr>
</table>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;"><tr><td style="background:#010100;border-radius:3px;">
<a href="<?php echo esc_url( $order->get_edit_order_url() ); ?>" style="display:inline-block;padding:10px 18px;color:#F4F2EC;font-size:13px;letter-spacing:.04em;text-decoration:none;">Open order in WordPress</a>
</td></tr></table>
		<?php else : ?>
<h1 style="margin:0 0 4px;font-family:<?php echo esc_attr( $font ); ?>;font-weight:300;font-size:22px;letter-spacing:-.01em;color:#010100;">Thank you<?php echo $order->get_billing_first_name() ? ', ' . esc_html( $order->get_billing_first_name() ) : ''; ?>.</h1>
<p style="margin:6px 0 0;">We’ve received your order.
			<?php if ( $phone ) : ?>
Our team will call you on <b><?php echo esc_html( $phone ); ?></b> to confirm it and arrange delivery.
			<?php else : ?>
Our team will contact you to confirm it and arrange delivery.
			<?php endif; ?>
</p>

<div style="<?php echo esc_attr( $label ); ?>">Your order #<?php echo esc_html( $order->get_order_number() ); ?></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="<?php echo esc_attr( $box ); ?>">
			<?php foreach ( $lines as $line ) : ?>
				<?php
				$thumb  = czera_email_thumb( $line );
				$detail = empty( $line['parts'] ) ? 'Qty ' . $line['item']->get_quantity() : implode( ' · ', array_map( 'czera_email_qty_name', $line['parts'] ) );
				?>
<tr>
<td style="<?php echo esc_attr( $cell ); ?>">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
				<?php if ( $thumb ) : ?>
<td style="padding-right:10px;vertical-align:middle;"><img src="<?php echo esc_url( $thumb ); ?>" width="46" height="46" alt="" style="display:block;width:46px;height:46px;border-radius:3px;background:#E7E1D5;object-fit:cover;border:0;"></td>
				<?php endif; ?>
<td style="vertical-align:middle;font-size:14px;color:#2B2B2B;"><?php echo esc_html( $line['item']->get_name() ); ?><br><span style="<?php echo esc_attr( $muted ); ?>"><?php echo esc_html( $detail ); ?></span></td>
</tr></table>
</td>
<td style="<?php echo esc_attr( $right . 'vertical-align:middle;' ); ?>"><?php echo $money( $line['total'] ); ?></td>
</tr>
			<?php endforeach; ?>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="<?php echo esc_attr( $box ); ?>margin-top:10px;">
<tr><td style="<?php echo esc_attr( $cell ); ?>">Items</td><td style="<?php echo esc_attr( $right ); ?>"><?php echo $money( $order->get_subtotal() ); ?></td></tr>
<tr><td style="<?php echo esc_attr( $cell ); ?>">Delivery</td><td style="<?php echo esc_attr( $right . ( $fee > 0 ? '' : 'color:#6B6B6B;' ) ); ?>"><?php echo $fee > 0 ? $money( $fee ) : 'Confirmed on the call'; ?></td></tr>
<tr><td style="<?php echo esc_attr( $cell . 'border-bottom:0;' ); ?>">Payment</td><td style="<?php echo esc_attr( $right . 'border-bottom:0;' ); ?>">On delivery</td></tr>
</table>

<div style="<?php echo esc_attr( $label ); ?>">Delivering to</div>
<div style="font-size:14px;color:#2B2B2B;"><?php echo czera_email_address( $order ); // phpcs:ignore WordPress.Security.EscapeOutput -- wp_kses, <br> only. ?></div>
		<?php endif; ?>
</td></tr>
		<?php if ( 'customer' === $kind ) : ?>
<tr><td align="center" style="background:#F4F2EC;padding:14px 24px;font-size:12px;color:#6B6B6B;">
Questions? Email <a href="mailto:support@czeramaison.com" style="color:#6B6B6B;">support@czeramaison.com</a><br>CZERA · czeramaison.com
</td></tr>
		<?php endif; ?>
</table>
</td></tr>
</table>
</body>
</html>
		<?php
		return ob_get_clean();
	}
}

// Replace the template's output for the three CZERA emails: start buffering before WooCommerce's
// header prints, and swap the buffer for the CZERA document after its footer.
add_action( 'woocommerce_email_header', function ( $heading, $email = null ) {
	if ( czera_email_kind( $email ) && $email->object instanceof WC_Order ) {
		ob_start();
		$GLOBALS['czera_email_buffering'] = $email;
	}
}, 1, 2 );

add_action( 'woocommerce_email_footer', function ( $email = null ) {
	if ( empty( $GLOBALS['czera_email_buffering'] ) || $GLOBALS['czera_email_buffering'] !== $email ) {
		return;
	}
	unset( $GLOBALS['czera_email_buffering'] );
	ob_end_clean();
	echo czera_email_render( czera_email_kind( $email ), $email->object ); // phpcs:ignore WordPress.Security.EscapeOutput -- built and escaped in czera_email_render().
}, 99999 );

// The three CZERA emails carry every style inline, so WooCommerce's email CSS would only fight them;
// every other email gets WooCommerce's CSS plus the CZERA layer.
add_filter( 'woocommerce_email_styles', function ( $css, $email = null ) {
	return czera_email_kind( $email ) ? '' : $css . czera_email_frame_css();
}, 99, 2 );

// CZERA subjects.
foreach ( [ 'new_order', 'customer_processing_order', 'customer_on_hold_order' ] as $czera_email_id ) {
	add_filter( 'woocommerce_email_subject_' . $czera_email_id, function ( $subject, $order, $email = null ) {
		$kind = czera_email_kind( $email );
		return ( $kind && $order instanceof WC_Order ) ? czera_email_subject( $kind, $order ) : $subject;
	}, 10, 3 );
}
