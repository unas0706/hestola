# HESTOLA --- Product & UI/UX Design Specification

**Document:** `design.md`\
**Project:** Hestola fashion e-commerce platform\
**Applications:** Customer-facing storefront + owner-only admin
dashboard\
**Version:** 1.0 --- Requirements baseline\
**Status:** Ready for implementation planning\
**Technology constraint:** MERN stack, JavaScript only (no TypeScript)

------------------------------------------------------------------------

## 1. Purpose and product vision

Hestola is a fashion brand selling men's and women's clothing in India,
positioned in the mid-range segment. The product consists of two
separate web applications connected to one backend:

1.  **Customer storefront:** A premium, modern shopping experience where
    customers discover products, choose variants, receive size guidance,
    pay, and manage orders.
2.  **Admin dashboard:** A private owner-only workspace for managing the
    catalogue, inventory, orders, customers, promotions, content,
    returns, reporting, and store configuration.

The storefront should combine the editorial typography and restrained
presentation associated with Zara-style fashion retail with the
accessible, product-forward browsing and merchandising approach
associated with H&M. These are design references, not templates to copy.

The design must feel like Hestola: distinctive, coherent, fashion-led,
easy to shop, and practical to operate.

### 1.1 Product goals

-   Make product discovery and purchase straightforward on mobile and
    desktop.
-   Present products through strong imagery, clear descriptions, variant
    selection, and useful fit information.
-   Reduce size-selection uncertainty with a height-and-weight-based
    size suggestion feature.
-   Give the owner control over day-to-day store operations without
    requiring code changes.
-   Keep catalogue categories, shipping integrations, payment
    configuration, policies, and homepage content configurable.
-   Maintain a consistent visual language across both applications while
    giving the admin a more information-dense layout.

### 1.2 Non-goals for the first design baseline

The following are not assumed as launch requirements unless the owner
later confirms them:

-   Native iOS or Android applications.
-   Marketplace or multi-vendor seller functionality.
-   Multiple admin staff accounts or role-based employee access.
-   International currencies, taxes, or shipping.
-   A fixed list of launch product categories.
-   A selected shipping aggregator or courier provider.
-   A fixed return window or policy.
-   AI-generated outfit recommendations or virtual try-on.
-   Social login providers other than those explicitly confirmed.

------------------------------------------------------------------------

## 2. Confirmed decisions and configurable items

### 2.1 Confirmed requirements

  -----------------------------------------------------------------------
  Area                                Decision
  ----------------------------------- -----------------------------------
  Business                            Men's and women's clothing /
                                      fashion

  Market                              India

  Price positioning                   Mid-range

  Brand logo                          Already exists; use supplied logo
                                      asset

  Brand identity                      Design the visual system around the
                                      existing logo

  Storefront direction                Premium editorial + modern
                                      product-forward commerce

  Typography reference                Zara-like editorial typography

  Layout / merchandising reference    H&M-like product presentation

  Customer authentication             Mobile number-based login / OTP

  Guest checkout                      Not allowed; customer must
                                      authenticate

  Product variants                    Size and colour variants supported

  Variant inventory                   Stock tracked for each size-colour
                                      combination

  Product media                       Multiple images; product videos
                                      supported

  Size guide                          Required

  Size suggestion                     Suggest size using customer's
                                      height and weight

  Payments                            UPI, cards, net banking, wallets,
                                      and COD

  Addresses                           Saved addresses and multiple
                                      delivery addresses

  Returns                             Return, exchange, refund request
                                      and admin processing

  Admin                               Owner-only dashboard

  CMS                                 Owner can manage homepage sections,
                                      banners, featured products,
                                      collections, campaigns, and
                                      announcement bar

  Theme                               Use the established Hestola
                                      palette; no separate dark-mode
                                      theme requirement

  Technology                          MERN, JavaScript / JSX only
  -----------------------------------------------------------------------

### 2.2 Decisions intentionally left configurable

Do not hard-code the following:

-   Product categories and subcategories.
-   Size labels and available size ranges by product.
-   Colour names and swatches.
-   Shipping provider and serviceability integration.
-   Shipping fee, free-shipping threshold, delivery estimates, and COD
    rules.
-   Return and exchange eligibility windows and conditions.
-   Payment gateway credentials and enabled payment methods.
-   GST/tax rules and invoice configuration.
-   Product price range constraints and discount rules.
-   Homepage section ordering and content.
-   Size recommendation thresholds and category-specific fit rules.

The admin settings and data model should allow these to be configured
later.

------------------------------------------------------------------------

## 3. Brand identity and visual design system

### 3.1 Existing brand assets

The supplied `HESTOLA – Logo Intro.html` includes an animated SVG logo,
the HESTOLA wordmark, and the tagline **"WEAR YOUR IDENTITY"**. It
defines these existing visual tokens:

  -----------------------------------------------------------------------
  Token                   Value                   Intended role
  ----------------------- ----------------------- -----------------------
  Hestola orange          `#D9541E`               Brand accent, key
                                                  actions, selected
                                                  states, small
                                                  highlights

  Near black              `#111111`               Primary text, dark
                                                  surfaces, footer and
                                                  high-contrast areas

  Warm ivory              `#F3EEE3`               Brand background and
                                                  editorial surfaces

  Warm grey               `#A39D90`               Secondary text,
                                                  dividers, muted UI
                                                  details
  -----------------------------------------------------------------------

The logo and tagline must be used consistently. Do not redraw, distort,
recolour unpredictably, or replace the supplied logo. Export a
production-ready SVG or transparent image asset from the source before
implementation; do not use the entire intro HTML as the site's logo
component.

### 3.2 Colour usage

Use the supplied colours as the foundation of the interface. The site
should not become an all-orange interface.

Recommended usage:

-   **Warm ivory `#F3EEE3`:** Brand-led hero panels, editorial blocks,
    selected page backgrounds, and occasional section backgrounds.
-   **Near black `#111111`:** Main typography, navigation, footer,
    icons, and strong contrast.
-   **Hestola orange `#D9541E`:** Primary CTA, active filter indicator,
    sale accents, notification highlights, and small brand details.
-   **Warm grey `#A39D90`:** Secondary labels, metadata, borders,
    dividers, disabled or low-emphasis content.

White may be used as a neutral product-canvas surface where necessary
for product photography and legibility. It is a functional neutral, not
a replacement brand colour.

Define semantic tokens in CSS variables. Check text/background contrast
before release. Do not use the orange for small text on ivory unless
contrast is verified.

### 3.3 Typography

The supplied logo intro uses **Bebas Neue** for the wordmark treatment
and **Inter** for supporting interface text. For the commerce
experience:

-   Use a refined editorial display typeface for large campaign headings
    and selected collection titles.
-   Use a highly legible sans-serif for body copy, navigation, product
    information, forms, prices, and admin UI.
-   Keep Bebas Neue primarily associated with the supplied wordmark /
    logo treatment or restrained display moments; do not force it into
    all interface text.
-   Use typography with clear hierarchy, generous line-height, and
    restrained letter spacing.
-   Confirm font licensing and load fonts efficiently.

The precise production font pairing is a design-system decision to
validate with the owner. Do not claim that the HTML source establishes a
complete website typography system.

### 3.4 Photography and art direction

-   Prioritize original Hestola product photography.
-   Use consistent lighting, crop ratios, model styling, and backgrounds
    across a collection.
-   Include front, back, side, detail, fabric, and on-model views where
    available.
-   Show garment fit and length clearly.
-   Use diverse models and body types where the brand's photography
    supports it.
-   Avoid generic stock imagery that weakens brand identity.
-   Ensure product images are sharp, appropriately compressed, and
    responsive.
-   Use image placeholders with fixed aspect ratios to avoid layout
    shift.

### 3.5 Layout principles

-   Fashion editorial compositions with generous whitespace.
-   Strong image-led storytelling.
-   Clean grid system and consistent gutters.
-   Large, restrained headlines.
-   Minimal decorative borders and shadows.
-   Product cards with consistent image ratios and clear information.
-   Mobile-first navigation and touch-friendly controls.
-   Avoid excessive gradients, glassmorphism, rounded dashboard cards,
    and generic SaaS styling on the storefront.

### 3.6 Motion and interaction

Motion should be subtle and purposeful:

-   Short fades and restrained slide transitions.
-   Product image alternate view on hover where hover exists.
-   Smooth drawer and modal transitions.
-   Clear add-to-cart feedback.
-   Avoid scroll-jacking, long intro animations, or motion that delays
    shopping.
-   Respect `prefers-reduced-motion`.
-   All essential functions must work without hover.

------------------------------------------------------------------------

## 4. Application architecture and navigation

### 4.1 Two applications, one platform

Recommended deployment structure:

-   Storefront: `www.hestola.in` (domain is illustrative; confirm before
    deployment).
-   Admin: `admin.hestola.in` (domain is illustrative; confirm before
    deployment).
-   API: `api.hestola.in` (domain is illustrative; confirm before
    deployment).

The two frontends should be separate React applications or separately
built frontends in a monorepo. They share the Express API, MongoDB
database, authentication/security services, media storage, and business
rules.

Do not expose admin routes or admin data to customer sessions. Admin
authentication must be isolated from customer authentication.

### 4.2 Storefront primary navigation

Desktop: - Hestola logo. - Men. - Women. - New Arrivals. - Collections /
category navigation, populated from admin-configured catalogue. -
Search. - Account. - Wishlist. - Bag/cart.

Mobile: - Menu trigger. - Logo. - Search trigger. - Bag/cart. -
Full-height or side navigation drawer containing configured categories,
account, wishlist, help, and policies.

Do not permanently display category labels that have not yet been
decided. Categories must come from admin-managed navigation data.

### 4.3 Admin navigation

Use a persistent sidebar on desktop and a responsive drawer on smaller
screens.

Suggested groups:

**Overview** - Dashboard

**Catalogue** - Products - Categories - Collections - Inventory

**Sales** - Orders - Returns & exchanges - Customers - Reviews

**Marketing** - Coupons & offers - Campaigns - Homepage / CMS -
Announcements

**Operations** - Shipping settings - Payment settings - Notifications

**Insights** - Analytics - Reports

**Configuration** - Store settings - Policies - Admin account / security

The owner-only requirement means there is one privileged owner account
at launch. The design may keep a future roles/permissions extension
point, but must not imply employee accounts are part of the confirmed
scope.

------------------------------------------------------------------------

# PART I --- CUSTOMER-FACING STOREFRONT

## 5. Storefront global elements

### 5.1 Announcement bar

Purpose: display a short operational or promotional message.

Elements: - Optional dismiss control. - Message text. - Optional link. -
Optional campaign start/end schedule.

Behaviour: - Content is editable in admin. - If no active announcement
exists, hide the bar without leaving a gap. - On mobile, wrap or
truncate safely; never overlap navigation. - Do not use multiple
rotating messages unless enabled by the owner.

### 5.2 Header

Elements: - Logo. - Configurable category navigation. - Search. -
Account. - Wishlist. - Cart with item count.

Behaviour: - Sticky header may be used after initial scroll. - Header
height should reduce subtly on scroll if it does not impair usability. -
Search opens a search overlay or dedicated search page. - Cart opens a
cart drawer or cart page; the full cart page remains available. -
Account routes to login when unauthenticated. - Wishlist routes to login
when unauthenticated, preserving the intended destination.

### 5.3 Footer

Sections: - Brand logo and tagline. - Customer service links. - About
Hestola. - Shopping / configured category links. - Policies: shipping,
returns, privacy, terms, cancellation. - Contact information and social
links. - Newsletter signup, if enabled. - Copyright and payment-method
marks where supported.

All content and links must be admin-editable. Do not fabricate contact
details or social URLs.

### 5.4 Global overlays

-   Search overlay.
-   Mobile navigation drawer.
-   Cart drawer.
-   Login / OTP dialog where suitable.
-   Confirmation dialogs.
-   Toast notifications.
-   Cookie / privacy notice if required by the final legal
    configuration.

Overlays must trap focus where appropriate, close via Escape, have clear
close controls, and preserve keyboard accessibility.

------------------------------------------------------------------------

## 6. Storefront page specifications

### 6.1 Homepage --- `/`

**Goal:** Introduce Hestola's brand, highlight current collections, and
direct customers into shopping.

Page sections, in recommended order:

1.  **Hero campaign**
    -   Full-width campaign image or responsive image/video.
    -   Campaign title and short supporting copy.
    -   Primary CTA such as "Shop Men" / "Shop Women" or a
        campaign-specific action.
    -   Optional secondary CTA.
    -   Text placement must preserve readability and not obscure the
        product/model.
    -   Hero media, copy, CTA, destination, and visibility are managed
        by CMS.
2.  **Shop by department**
    -   Men and Women visual entry cards.
    -   These are departments, not a final category list.
    -   Each card links to its department landing page.
3.  **New arrivals**
    -   Product carousel or responsive grid.
    -   Product image, name, price, colour availability, and wishlist
        control.
    -   Only published, in-stock or explicitly backorder-enabled
        products appear.
4.  **Featured collection**
    -   Editorial image and collection description.
    -   CTA to collection page.
    -   Entire section is CMS-configurable.
5.  **Trending / bestsellers**
    -   Product grid based on admin selection or configured sales rule.
    -   Do not label items "bestseller" without a valid rule or admin
        selection.
6.  **Brand story / campaign editorial**
    -   Short brand statement.
    -   Campaign photography.
    -   Link to About page.
7.  **Promotional banner**
    -   Optional campaign block with expiry-aware visibility.
8.  **Social / Instagram inspiration**
    -   Optional curated social gallery.
    -   Use approved assets or supported embeds/API integration; do not
        scrape Instagram.
    -   Link to the verified official profile.
9.  **Newsletter**
    -   Email field if newsletter is enabled.
    -   Consent text and success/error states.
    -   Newsletter is optional and should not block checkout.
10. **Footer**

Homepage rules: - Admin controls section order, visibility, content,
links, images, and scheduling. - If a section has no valid content, hide
it cleanly. - Ensure page remains visually balanced when optional
sections are absent. - Mobile hero crop and text placement must be
separately configurable.

### 6.2 Department landing pages --- `/men`, `/women`

**Goal:** Introduce each department and expose its configured categories
and products.

Elements: - Department hero or editorial image. - Department title and
short description. - Category tiles populated from active admin-managed
categories. - Featured collection. - New arrivals / curated product
selection. - Optional campaign strip.

Rules: - Do not hard-code category names. - Empty departments should not
show broken grids; show a CMS-configured editorial message or hide the
entry point. - Department content is independently configurable.

### 6.3 Product listing / category page --- `/category/:slug`

**Goal:** Help customers browse a product set and narrow results.

Elements: - Breadcrumbs. - Category title and optional description. -
Optional category banner. - Product count. - Sort control. - Filter
controls. - Product grid. - Pagination or "load more" control.

Filters, when applicable: - Department. - Category. - Size. - Colour. -
Price range. - Availability. - Collection. - Other attributes configured
for the catalogue.

Sort options: - Recommended. - Newest. - Price: low to high. - Price:
high to low. - Popularity, only if a defensible popularity metric
exists.

Product card: - Primary image. - Secondary image on hover where
available. - Product name. - Price and sale price if applicable. -
Colour swatches or colour count. - Wishlist control. - Badges such as
New or Sale, only when valid. - Quick add only if variant selection can
be completed clearly.

States: - Loading skeletons. - No products. - No products matching
filters. - API error with retry. - Out-of-stock product presentation.

Mobile: - Filters open in a bottom sheet or full-screen drawer. - Sort
control remains easy to reach. - Product grid defaults to two columns
where product photography remains legible. - Filter selections remain
visible and removable as chips.

### 6.4 Search --- `/search?q=...`

**Goal:** Find products by keyword.

Elements: - Search input with clear action. - Suggested searches /
popular terms if configured. - Recent searches stored locally only with
appropriate privacy expectations. - Product results grid. - Result
count. - Filters and sort. - Search suggestions while typing, with
debouncing.

Search should index: - Product name. - SKU. - Description. - Category
and collection. - Colour and other searchable attributes.

States: - Empty query. - Suggestions loading. - Results found. - No
results with suggestions to browse departments. - Search service
unavailable.

Do not expose unpublished products or internal stock data.

### 6.5 Product detail page --- `/product/:slug`

**Goal:** Give customers sufficient information and confidence to choose
a product and buy it.

Recommended desktop layout: - Left: large image gallery / thumbnails. -
Right: sticky purchase-information column. - Lower sections: details,
fit, size guide, delivery, reviews, related products.

Mobile layout: - Swipeable image gallery at top. - Product information
immediately below. - Variant selection and size help before
add-to-bag. - Sticky bottom purchase bar when appropriate.

Content and controls: 1. Breadcrumb. 2. Product name. 3. Price, sale
price, and savings where applicable. 4. Tax/shipping note configured for
the store. 5. Image gallery with zoom. 6. Product video, if present. 7.
Colour selector with accessible labels. 8. Size selector for the
selected colour. 9. Size guide. 10. **Find my size** height-and-weight
suggestion. 11. Stock availability for selected variant. 12. Quantity
selector, bounded by available stock and purchase limits. 13. Add to
bag. 14. Wishlist. 15. Delivery PIN-code check, if serviceability API is
configured. 16. Product description. 17. Fabric / material / care
information. 18. Fit and model information. 19. Returns / exchange
summary linked to current policy. 20. Customer reviews and ratings. 21.
Related products / "You may also like". 22. Recently viewed products, if
enabled.

Variant behaviour: - A product may have multiple colours and sizes. -
Stock belongs to a specific size-colour variant (SKU). - Selecting a
colour updates available sizes, images, and stock. - Selecting an
unavailable variant disables purchase and explains the state. - Do not
silently switch the customer's selected colour or size. - Price can vary
by variant only if configured.

Add-to-bag behaviour: - Validate colour, size, and quantity. - Add the
exact variant to cart. - Show confirmation in cart drawer/toast. - Keep
the customer on the product page. - Prevent duplicate submissions while
request is pending.

### 6.6 Size guide --- product modal or `/size-guide`

**Goal:** Explain garment measurements and sizing conventions.

Elements: - Size chart appropriate to the product's configured
fit/category. - Measurement units (cm/inches). - How to measure
instructions. - Fit description: slim, regular, relaxed, oversized, or
configured alternative. - Model height and worn size, if supplied. -
Disclaimer that fit may vary by garment and personal preference.

Rules: - Size charts are category/product configurable. - Never show a
generic chart as if it were verified for every product. - If no chart
exists, clearly state that the guide is unavailable and provide customer
support route.

### 6.7 Find my size --- height/weight size suggestion

**Goal:** Give a useful starting recommendation without presenting an
estimate as a guarantee.

Inputs: - Height (cm; optional conversion from feet/inches). - Weight
(kg; optional conversion from pounds). - Optional fit preference:
regular, relaxed, or snug. - Optional body/measurement inputs may be
considered later, but are not required for the initial feature.

Output: - Suggested size for the currently selected product. -
Confidence label such as "Suggested starting point" or "More information
needed". - Brief explanation. - Link to size chart. - Ability to choose
another size manually.

Important design and product rules: - The recommendation must use a
product/category-specific size model configured from actual Hestola size
charts and fit data. - Do not invent universal height/weight
thresholds. - Height and weight alone cannot reliably determine body
proportions or garment fit. - If the model lacks enough validated data,
show a transparent message and direct the customer to the size chart
rather than fabricating a recommendation. - The user must always be able
to override the suggested size. - Do not automatically add the suggested
size to cart. - Do not store height/weight by default. If persistence is
later introduced, obtain clear consent, explain purpose, provide
deletion controls, and apply data minimization. - Treat inputs as
personal data and do not expose them to analytics, ad pixels, or admin
customer profiles unless a justified and consented business requirement
is approved. - Do not describe the feature as medical, body assessment,
or guaranteed fit advice. - Capture optional anonymous feedback ("Did
this size work for you?") only with appropriate privacy controls.

Suggested flow: 1. Customer opens "Find my size". 2. Modal explains that
this is an estimate. 3. Customer enters height and weight and selects
fit preference. 4. Frontend validates sensible input ranges and units.
5. Backend or a versioned rules service evaluates the product-specific
size chart. 6. Result displays a suggested size, explanation, and
confidence. 7. Customer chooses "Select this size" or manually selects
another. 8. Selected size returns to product page; no cart action occurs
until customer clicks Add to bag.

### 6.8 Wishlist --- `/wishlist`

**Goal:** Save products for later.

Elements: - Product grid. - Remove item action. - Move to bag / select
variant. - Current price and availability. - Empty state with browse
CTA.

Rules: - Login required. - Wishlist must survive sign-out and sign-in. -
If a product becomes unpublished, unavailable, or deleted, handle it
gracefully. - Do not reserve stock for wishlisted items.

### 6.9 Cart --- `/cart` and cart drawer

**Goal:** Review selected items before checkout.

Elements: - Product image and name. - Selected colour and size. -
Quantity controls. - Unit price and line total. - Remove / save for
later if supported. - Coupon field. - Subtotal. - Discount. - Shipping
estimate or "calculated at checkout". - Tax information as configured. -
Total. - Continue shopping. - Proceed to checkout.

Rules: - Revalidate stock and price on cart load and before checkout. -
Quantity cannot exceed available stock. - If price or availability
changes, explain before proceeding. - Coupon validation must show clear
success/failure reasons. - Cart is associated with the authenticated
customer; merge anonymous cart only if anonymous cart is later
enabled. - Never treat a cart as an inventory reservation unless a
reservation policy is explicitly implemented.

### 6.10 Checkout --- `/checkout`

**Goal:** Complete an authenticated customer's order with minimal
friction.

Checkout steps: 1. Contact / authenticated customer confirmation. 2.
Delivery address. 3. Delivery method / shipping quote, once provider is
chosen. 4. Order summary. 5. Payment method. 6. Review and place order.

Address fields: - Recipient name. - Mobile number. - Address line 1 and
line 2. - Landmark (optional). - City. - State. - PIN code. - Address
label (Home, Work, Other). - Default-address option.

Payment options: - UPI. - Credit/debit card. - Net banking. - Wallets. -
Cash on Delivery.

Rules: - Show only payment methods enabled in admin and supported by the
configured gateway. - COD may be disabled based on PIN code, order
value, risk rules, or owner settings. - Do not store raw card data. -
Payment confirmation must be verified server-to-server with the payment
provider. - Prevent duplicate order creation and duplicate payment
capture. - Clearly distinguish order created, payment pending, payment
failed, and payment successful. - If payment fails, allow a safe retry
without creating duplicate orders. - Shipping charge and delivery
estimate must come from configured shipping logic. - Final policies and
tax treatment remain configurable.

### 6.11 Order confirmation --- `/order-confirmation/:orderId`

Elements: - Confirmation status. - Order number. - Payment status. -
Delivery address summary. - Items and totals. - Estimated delivery only
when provided by shipping service or configured rule. - View order
button. - Continue shopping.

Do not display a success state until the server has confirmed order
creation. Payment status should be explicit.

### 6.12 Authentication pages

#### Login --- `/login`

-   Mobile number input with country code defaulted to India (+91).
-   Continue button.
-   OTP verification state.
-   Resend timer and resend control.
-   Change number.
-   Terms/privacy acknowledgement where required.

#### OTP verification

-   One-time code input.
-   Paste support.
-   Auto-advance where appropriate.
-   Error, expired, and resend states.
-   Rate-limit feedback.
-   Do not reveal whether an arbitrary number belongs to an existing
    account.

#### Registration / first-time profile completion

-   Name.
-   Mobile number verification.
-   Optional email if the business later chooses to collect it.
-   Consent and policy links.

Customer access is mobile OTP-based in the current requirements.
Password login and social login are not part of this baseline.

### 6.13 Account dashboard --- `/account`

Elements: - Customer name and verified mobile. - Order summary. - Recent
orders. - Saved addresses. - Wishlist shortcut. - Profile settings. -
Support links. - Logout.

Mobile should use a clear account navigation list rather than a dense
desktop sidebar.

### 6.14 Profile --- `/account/profile`

-   Name.
-   Verified mobile number.
-   Optional email if collected.
-   Edit profile.
-   Account deletion request / privacy contact path.
-   Save and validation states.

Do not expose OTPs or authentication secrets.

### 6.15 Address book --- `/account/addresses`

-   List saved addresses.
-   Add address.
-   Edit address.
-   Delete address.
-   Set default address.
-   Validation for Indian PIN code and mobile number.
-   Confirm before deleting an address used by an active order; preserve
    order snapshots.

### 6.16 Orders --- `/account/orders`

-   Order list.
-   Order number and date.
-   Item thumbnails.
-   Amount.
-   Payment status.
-   Fulfilment status.
-   View details.
-   Empty state.

Filters may include date and status if order volume warrants them.

### 6.17 Order detail and tracking --- `/account/orders/:orderId`

-   Order timeline.
-   Items and selected variants.
-   Payment summary.
-   Shipping address snapshot.
-   Tracking link / tracking events when shipping integration is active.
-   Cancellation action only when eligible.
-   Return / exchange request action only when eligible.
-   Invoice download when generated.
-   Contact support.

Status labels must be consistent with admin order workflow. Do not show
invented tracking updates.

### 6.18 Return / exchange request --- `/account/orders/:orderId/return`

-   Select eligible item(s) and quantities.
-   Choose return or exchange.
-   Select reason.
-   Add comments.
-   Upload photos only if required by configured policy.
-   For exchange, choose available replacement variant.
-   Show policy summary and next steps.
-   Submit request and confirmation.

Rules: - Eligibility must be calculated server-side using configurable
policy. - Do not promise approval or refund timing before review. - Show
request status and admin response. - Prevent duplicate active requests
for the same item unless policy permits.

### 6.19 Reviews --- `/account/reviews` and product review form

-   Only eligible purchasers can review, if verified-purchase policy is
    enabled.
-   Rating and written feedback.
-   Optional image upload if enabled.
-   Edit/delete rules configurable.
-   Review moderation status.
-   Clear indication when review is pending moderation.

### 6.20 About Hestola --- `/about`

-   Brand story.
-   Brand philosophy.
-   "WEAR YOUR IDENTITY" tagline.
-   Approved brand photography.
-   Optional milestones / values.
-   Content editable through CMS.

Do not invent company history, founders, sustainability claims, or
manufacturing claims. Publish only owner-approved content.

### 6.21 Contact --- `/contact`

-   Contact information from store settings.
-   Contact form with name, mobile/email, topic, and message.
-   Form validation and submission confirmation.
-   Spam protection.
-   Support hours if configured.
-   Links to official social channels.

### 6.22 FAQ --- `/faq`

-   Searchable or grouped questions.
-   Topics such as orders, payments, shipping, size guide, returns, and
    account.
-   Questions and answers admin-managed.
-   Do not publish answers until operational policy is confirmed.

### 6.23 Policy pages

Routes: - `/policies/shipping` - `/policies/returns` -
`/policies/refund` - `/policies/cancellation` - `/policies/privacy` -
`/policies/terms`

Content must be owner-approved and editable. Do not invent legal
language or operational promises. Keep version/effective date where
appropriate.

### 6.24 404 and service error pages

-   Branded not-found page with clear route back to home or shopping.
-   Generic service error page with retry.
-   Do not expose stack traces, internal API URLs, database errors, or
    sensitive details.

------------------------------------------------------------------------

# PART II --- OWNER ADMIN DASHBOARD

## 7. Admin design principles

The admin dashboard is for one owner. It should prioritize speed,
clarity, safe operations, and actionable information over decorative
visuals.

Use the Hestola palette: - Near-black for primary text and navigation. -
Warm ivory for selected surfaces. - Orange for primary actions and
meaningful highlights. - Warm grey for secondary information and
dividers.

The admin should share the brand identity but can use a more compact,
data-dense layout than the storefront. Do not introduce a separate
dark-mode theme in this baseline.

### 7.1 Global admin shell

Desktop: - Left sidebar with grouped navigation. - Top bar with page
title / breadcrumbs. - Search or command entry only if implemented
meaningfully. - Notification indicator. - Owner account menu. - Main
content area.

Mobile: - Collapsible navigation drawer. - Compact top bar. - Tables
transform into readable cards or horizontally scrollable data grids. -
Forms use single-column layouts. - Primary actions remain accessible
without covering content.

Global patterns: - Consistent page title, description, and primary
action. - Breadcrumbs on nested screens. - Toast feedback. -
Confirmation dialog for destructive actions. - Unsaved-changes
warning. - Loading skeletons. - Empty states with a useful next
action. - Error state with retry. - Search, filter, sort, and pagination
patterns shared across modules.

## 8. Admin page specifications

### 8.1 Admin login --- `/admin/login`

Elements: - Hestola logo. - Owner mobile number field. - OTP
verification. - Resend OTP. - Security notice. - Error and rate-limit
states.

Rules: - Only the configured owner identity can access the dashboard. -
Public registration is not available. - Protect against brute force and
OTP abuse. - Use secure, HTTP-only session cookies where architecture
permits. - Require re-authentication for sensitive actions.

### 8.2 Dashboard overview --- `/admin`

**Goal:** Provide a concise view of store health and actions requiring
attention.

Summary metrics: - Gross sales / net sales with clear definitions. -
Orders. - Average order value. - Units sold. - Refunds / returns. -
Conversion rate only if reliable analytics instrumentation exists. - New
customers.

Charts: - Sales over time. - Orders over time. - Sales by
department/category. - Payment method distribution. - Top products.

Operational panels: - Orders awaiting processing. - Low-stock
variants. - Out-of-stock products. - Return/exchange requests awaiting
review. - Payment issues. - Recently updated products. - Recent orders.

Controls: - Date range. - Compare previous period where valid. - Export
only where supported.

Rules: - Every metric must define its calculation and time zone. - Avoid
showing placeholder or fabricated data. - Empty states should explain
when data will appear. - Use INR formatting. - Date/time display should
use store timezone configured for India, with an explicit timezone
setting.

### 8.3 Product list --- `/admin/products`

Elements: - Product table/list. - Search by product name, SKU, slug. -
Filters: status, department, category, collection, stock state. -
Sort. - Pagination. - Bulk actions: publish/unpublish, archive, assign
collection, export where supported. - Add product CTA.

Columns: - Product image. - Name. - SKU or product identifier. -
Department/category. - Price. - Status. - Variant count. - Stock
summary. - Last updated. - Actions.

Rules: - Draft, published, archived states. - Warn before leaving
unsaved product changes. - Do not permanently delete products referenced
by orders; archive instead. - Bulk actions require confirmation and
clear result reporting.

### 8.4 Create / edit product --- `/admin/products/new`, `/admin/products/:id/edit`

Form sections:

**Basic information** - Product name. - Slug. - Short description. -
Full description. - Department (Men/Women; configurable). - Category and
subcategory (admin-defined). - Collection assignment. - Tags.

**Pricing** - Base price. - Sale price / discount configuration. - Tax
configuration reference. - Cost price optional and private to admin. -
Price validation.

**Media** - Multiple images. - Reorder images. - Set primary image. -
Alt text. - Product video. - Upload progress and validation. - Image
crop / preview if supported.

**Variants** - Size options. - Colour options. - Generate size-colour
combinations. - Variant-specific SKU. - Variant-specific price if
needed. - Variant-specific stock. - Variant-specific image mapping. -
Variant active/inactive status.

**Fit and product details** - Fit type. - Fabric / material. - Care
instructions. - Product measurements. - Model height and worn size. -
Size chart assignment. - Size recommendation model assignment.

**Discovery and merchandising** - SEO title. - Meta description. -
Search tags. - Featured product flag. - New-arrival flag with date
logic. - Related products.

**Publishing** - Save draft. - Preview. - Publish. - Schedule publishing
if implemented.

Validation: - Product name required. - Valid price and currency. - At
least one valid variant before publishing when variants are required. -
Primary image required for published products. - SKU uniqueness. - Stock
cannot be negative. - Slug uniqueness. - Explain errors inline.

### 8.5 Category management --- `/admin/categories`

Elements: - Category tree/list. - Department association. - Category
name and slug. - Parent category. - Image / banner. - Description. -
Display order. - Active / inactive state. - Navigation visibility.

Rules: - Categories are intentionally not fixed in this specification. -
Owner can add, edit, reorder, activate, and deactivate categories. -
Prevent deleting a category with active products unless products are
reassigned. - URL changes should support redirects or preserve old slugs
where possible.

### 8.6 Collection management --- `/admin/collections`

Elements: - Collection name and slug. - Description. - Cover image. -
Product selection. - Manual or rule-based collection type if
supported. - Display order. - Start/end schedule. - Visibility. -
Preview.

Examples such as "New Arrivals" or seasonal collections are illustrative
only; actual collections are owner-defined.

### 8.7 Inventory --- `/admin/inventory`

**Goal:** Manage stock at size-colour variant level.

Elements: - Inventory table with product, variant, SKU, available
quantity, reserved quantity if reservation is implemented, and status. -
Search and filters. - Low-stock threshold. - Stock adjustment action. -
Bulk import/export if implemented. - Inventory movement history.

Stock adjustment form: - Variant. - Current quantity. - Adjustment type
(add, remove, set). - Quantity. - Reason. - Reference / note. -
Confirmation.

Rules: - Maintain an auditable inventory ledger. - Record order
placement, cancellation, return restock, and manual adjustment
separately. - Use atomic stock updates / transactions or another
concurrency-safe strategy. - Never allow negative stock unless an
explicit backorder policy is enabled. - Low-stock threshold should be
configurable globally and optionally per variant.

### 8.8 Orders list --- `/admin/orders`

Elements: - Search by order number, customer name/mobile, or payment
reference. - Filters: order status, payment status, date range,
fulfilment status, payment method. - Sort and pagination. - Export if
supported.

Columns: - Order number. - Date. - Customer. - Item count. - Total. -
Payment method. - Payment status. - Order status. - Fulfilment status. -
Actions.

Order status and payment status must be separate concepts. Example order
states may include placed, confirmed, processing, shipped, delivered,
cancelled. Final workflow labels should be agreed during implementation.

### 8.9 Order detail --- `/admin/orders/:id`

Sections: - Order header and current status. - Customer snapshot. -
Delivery address snapshot. - Items and selected variants. - Price
breakdown. - Payment details and gateway reference. - Fulfilment /
shipment information. - Status timeline. - Internal admin notes. -
Customer-visible notes. - Invoice. - Cancellation / return history.

Actions: - Confirm or process order. - Mark ready for shipment where
manual flow is used. - Create shipment / tracking when provider
integration exists. - Update status only through valid transitions. -
Cancel eligible order. - Initiate refund through supported payment
provider or mark external/manual refund with audit details. -
Print/download invoice. - Contact customer using configured channel.

Rules: - Do not permit arbitrary status jumps. - Record actor,
timestamp, old state, new state, and reason. - Do not mark payment
refunded until provider confirmation or a documented manual refund
record exists. - Preserve an immutable order-item and address snapshot.

### 8.10 Returns and exchanges --- `/admin/returns`

List: - Request number. - Order. - Customer. - Request type. - Item /
variant. - Reason. - Request date. - Current status.

Detail: - Customer request and evidence. - Policy eligibility result. -
Item and order details. - Admin notes. - Approve / reject. - Exchange
variant selection and stock check. - Return pickup / shipment details
when integration exists. - Inspection outcome. - Refund / replacement
action. - Timeline.

Rules: - Use configurable policy rules. - Every decision requires an
audit event. - Do not promise a refund completion date unless provider
and policy support it. - Exchange fulfilment must verify replacement
stock. - Restock returned units only after the configured inspection /
receipt step.

### 8.11 Customer management --- `/admin/customers`

Elements: - Customer list. - Search by name/mobile. - Order count. -
Total spend with defined calculation. - Last order date. - Account
status. - Customer detail view.

Customer detail: - Profile information. - Order history. - Saved
addresses only to the extent necessary for support. - Return / exchange
history. - Reviews. - Support notes.

Privacy: - Do not display OTPs, passwords, payment credentials, or
unnecessary sensitive data. - Height/weight used in size suggestion must
not be added to the customer profile by default. - Restrict exports and
protect personal data. - Provide deletion/anonymization workflow
consistent with legal and accounting retention obligations.

### 8.12 Reviews moderation --- `/admin/reviews`

Elements: - Review list. - Product. - Rating. - Customer /
verified-purchase indicator. - Date. - Moderation status. - Review
content. - Optional media preview.

Actions: - Approve. - Reject with internal reason. - Hide / restore. -
Flag for follow-up.

Rules: - Do not silently rewrite customer reviews. - Keep moderation
audit history. - Only show approved reviews on storefront. - Verified
purchase badge only when order eligibility is actually verified.

### 8.13 Coupons and promotions --- `/admin/marketing/coupons`

Fields: - Coupon code. - Discount type: fixed or percentage. - Discount
value. - Minimum cart value. - Maximum discount cap. - Eligible
products/categories/collections. - Customer eligibility. - Usage
limit. - Per-customer usage limit. - Start/end date. - Active state. -
Optional first-order rule.

Rules: - Validate coupon server-side. - Prevent stacking unless
explicitly configured. - Explain why a coupon is invalid. - Prevent
expired or exhausted coupons from being applied. - Log usage and
discount attribution.

### 8.14 Campaign management --- `/admin/marketing/campaigns`

Elements: - Campaign name. - Creative assets. - Copy and CTA. -
Destination. - Start/end schedule. - Placement. - Active status. -
Preview.

Campaigns can feed homepage hero, promotional blocks, and department
pages. Scheduling must use the configured store timezone.

### 8.15 Homepage / CMS --- `/admin/content/homepage`

**Goal:** Give the owner control of the storefront homepage without code
changes.

Elements: - Visual section list. - Add section. - Reorder sections. -
Enable/disable section. - Edit content. - Image/video selection. -
Desktop and mobile asset fields. - CTA label and destination. - Preview
desktop/mobile. - Save draft. - Publish. - Schedule publishing if
supported.

Supported section types: - Hero campaign. - Department cards. - Product
grid. - Collection feature. - Editorial image/text. - Promotional
banner. - Social gallery. - Newsletter block. - Brand story. - Custom
rich-text section with safe supported formatting.

Rules: - Only supported section types may be created. - Validate links
and media before publish. - Preview must reflect actual storefront
rendering. - Avoid arbitrary HTML/script injection. - Keep draft and
published versions separate.

### 8.16 Banner management --- `/admin/content/banners`

-   Banner title.
-   Asset.
-   Mobile asset.
-   Alt text.
-   CTA and destination.
-   Placement.
-   Start/end date.
-   Active state.
-   Preview.
-   Reorder where multiple banners exist.

### 8.17 Announcement bar --- `/admin/content/announcement`

-   Message.
-   Optional link.
-   Start/end schedule.
-   Active toggle.
-   Preview.
-   Dismissible setting.

### 8.18 Store pages and policies --- `/admin/content/pages`

Manage: - About page. - Contact content. - FAQ. - Shipping policy. -
Returns policy. - Refund policy. - Cancellation policy. - Privacy
policy. - Terms and conditions.

Use a safe rich-text editor with a preview. Store version and
publication metadata. Legal content requires owner/legal review.

### 8.19 Shipping settings --- `/admin/settings/shipping`

Provider is undecided. Build the settings UI and integration boundary
without assuming a vendor.

Potential configuration: - Provider selection. - API credentials (secure
secret storage; masked after save). - Pickup address. - Serviceability /
PIN-code rules. - Shipping fee rules. - Free-shipping threshold. - COD
availability. - Package defaults. - Manual fulfilment fallback. - Test
connection / status.

Do not display or log raw API secrets. Do not claim live rates or
tracking until integration is active.

### 8.20 Payment settings --- `/admin/settings/payments`

-   Payment gateway configuration.
-   Enabled payment methods.
-   COD toggle and rules.
-   Gateway status.
-   Test/live mode indicator.
-   Webhook status.
-   Masked credential fields.
-   Payment reconciliation view or report.

Credentials must be stored securely server-side. Never expose secrets to
React clients or logs. Payment gateway selection remains to be
confirmed.

### 8.21 Notifications settings --- `/admin/settings/notifications`

Configure customer notifications for: - OTP. - Order placed. - Payment
success/failure. - Order confirmed. - Shipped. - Delivered. -
Cancellation. - Return/exchange status. - Refund status.

Channels (SMS, email, WhatsApp) must be enabled only after provider
selection and consent/legal requirements are addressed. The confirmed
customer login channel is mobile OTP; notification channels beyond that
remain configurable.

### 8.22 Analytics --- `/admin/analytics`

Reports: - Sales over time. - Orders over time. - Average order value. -
Units sold. - Top products. - Sales by department/category/collection. -
Discount usage. - Return/refund rate. - Payment method mix. - New vs
returning customers, if identity data supports it. - Inventory
sell-through / ageing if required.

Controls: - Date range. - Grouping. - Filters. - Export CSV where
supported.

Definitions: - Clearly distinguish gross sales, discounts, refunds, tax,
shipping, and net revenue. - Exclude cancelled or failed orders from
relevant sales metrics. - Avoid claiming marketing attribution unless
tracking is implemented and consented. - Document timezone and
calculation rules.

### 8.23 Reports --- `/admin/reports`

-   Sales report.
-   Orders report.
-   Inventory report.
-   Returns/refunds report.
-   Customer report.
-   Coupon report.

Features: - Date filters. - Download CSV. - Print-friendly view. -
Access limited to owner. - Mask or omit personal data not needed for the
report.

### 8.24 Store settings --- `/admin/settings/store`

-   Store name.
-   Logo assets.
-   Tagline.
-   Contact details.
-   Store address.
-   Currency (INR initially).
-   Timezone (India default; configurable).
-   Tax settings reference.
-   Social links.
-   SEO defaults.
-   Store status / maintenance mode.

### 8.25 Policies and business rules --- `/admin/settings/policies`

-   Return window.
-   Exchange eligibility.
-   Refund handling.
-   Cancellation cut-off.
-   COD rules.
-   Shipping fee rules.
-   Product exclusions.
-   Customer-facing policy text.

All rules should be explicit, versioned where practical, and applied
server-side. The UI must show the current effective policy.

### 8.26 Admin profile and security --- `/admin/settings/security`

-   Owner profile.
-   Verified mobile.
-   Session list / revoke sessions where supported.
-   Sign out.
-   Re-authentication for sensitive changes.
-   Login activity / security events.
-   Password or OTP recovery process as configured.

No employee management UI is required in the initial release.

------------------------------------------------------------------------

## 9. Core user journeys

### 9.1 Customer purchase journey

1.  Customer lands on homepage.
2.  Selects Men, Women, or a configured collection.
3.  Browses listing and applies filters.
4.  Opens product detail.
5.  Views images, description, size guide, and size suggestion.
6.  Selects colour, size, and quantity.
7.  Adds variant to bag.
8.  Opens cart and checks totals.
9.  Proceeds to checkout.
10. Logs in or verifies mobile number if session is not active.
11. Selects or adds delivery address.
12. Selects available shipping option.
13. Selects payment method.
14. Places order.
15. Receives server-confirmed order result.
16. Views order detail and tracking.
17. Requests return/exchange if eligible.

### 9.2 Customer size suggestion journey

1.  Customer selects a product and colour.
2.  Opens "Find my size".
3.  Enters height and weight.
4.  Chooses fit preference.
5.  Receives product-specific suggested size or a transparent "not
    enough information" response.
6.  Reviews size chart.
7.  Selects suggested or alternative size.
8.  Adds selected variant to cart manually.

### 9.3 Owner product publishing journey

1.  Owner signs in.
2.  Opens Products.
3.  Creates product.
4.  Adds description, department, category, pricing, and media.
5.  Defines sizes and colours.
6.  Generates variants and assigns SKU/stock.
7.  Adds size chart and fit information.
8.  Previews desktop and mobile.
9.  Saves draft or publishes.
10. Product becomes visible only after validation and publication.

### 9.4 Owner order fulfilment journey

1.  Owner opens Orders.
2.  Reviews new order and payment state.
3.  Confirms order.
4.  Processes items.
5.  Creates shipment through configured provider or manual workflow.
6.  Adds tracking details if available.
7.  Marks dispatched/shipped.
8.  Updates delivery state from provider or manual confirmation.
9.  Handles cancellation/return/refund requests through dedicated
    workflows.

### 9.5 Owner homepage update journey

1.  Owner opens Homepage CMS.
2.  Adds or edits section.
3.  Selects desktop/mobile media.
4.  Updates text and CTA.
5.  Reorders section.
6.  Previews desktop and mobile.
7.  Saves draft.
8.  Publishes or schedules.
9.  Storefront reflects the published version.

------------------------------------------------------------------------

## 10. Responsive behaviour

### 10.1 Breakpoints

Use responsive breakpoints based on layout needs rather than device
names. Suggested starting points:

-   Small mobile: below 480px.
-   Mobile: 480--767px.
-   Tablet: 768--1023px.
-   Desktop: 1024--1439px.
-   Wide desktop: 1440px and above.

These are implementation starting points, not rigid design constraints.

### 10.2 Storefront

Mobile: - Compact header and navigation drawer. - Two-column product
grid where practical. - Full-screen filter sheet. - Swipeable product
gallery. - Sticky add-to-bag area where it does not obscure content. -
Single-column checkout. - Large touch targets. - Avoid hover-only
features.

Tablet: - Adaptive product grid. - Side-by-side product detail where
space permits. - Filter drawer or collapsible filter panel.

Desktop: - Full navigation. - Multi-column product grid. - Large product
gallery. - Sticky purchase panel where useful. - Wider editorial
imagery.

### 10.3 Admin

Mobile: - Sidebar becomes drawer. - Dense tables become cards or
carefully designed horizontal tables. - Filters in a drawer. - Forms
become single-column. - Sticky save action only where it does not
obscure content.

Desktop: - Persistent sidebar. - Full tables and analytics. -
Multi-column forms where sensible. - Wider dashboard charts.

All key owner operations must remain usable on mobile even if desktop is
the primary admin environment.

------------------------------------------------------------------------

## 11. Shared component inventory

### Storefront components

-   `AnnouncementBar`
-   `StoreHeader`
-   `DesktopNavigation`
-   `MobileNavigationDrawer`
-   `SearchOverlay`
-   `SearchInput`
-   `StoreFooter`
-   `ProductCard`
-   `ProductGrid`
-   `ProductCarousel`
-   `PriceDisplay`
-   `ColourSwatches`
-   `VariantSelector`
-   `QuantitySelector`
-   `ProductGallery`
-   `ImageZoom`
-   `SizeGuideModal`
-   `FindMySizeModal`
-   `WishlistButton`
-   `AddToCartButton`
-   `CartDrawer`
-   `CartLineItem`
-   `CouponInput`
-   `AddressCard`
-   `AddressForm`
-   `PaymentMethodSelector`
-   `OrderTimeline`
-   `ReviewCard`
-   `Breadcrumbs`
-   `FilterDrawer`
-   `SortSelector`
-   `Pagination`
-   `Toast`
-   `Modal`
-   `EmptyState`
-   `ErrorState`
-   `LoadingSkeleton`

### Admin components

-   `AdminShell`
-   `AdminSidebar`
-   `AdminTopbar`
-   `PageHeader`
-   `MetricCard`
-   `DateRangePicker`
-   `DataTable`
-   `MobileRecordCard`
-   `TableToolbar`
-   `FilterPanel`
-   `StatusBadge`
-   `ConfirmDialog`
-   `FormField`
-   `ImageUploader`
-   `MediaGalleryEditor`
-   `VariantMatrixEditor`
-   `InventoryAdjustmentDialog`
-   `OrderStatusTimeline`
-   `RichTextEditor`
-   `HomepageSectionEditor`
-   `PreviewFrame`
-   `ReportExportControl`
-   `Toast`
-   `EmptyState`
-   `ErrorState`
-   `LoadingSkeleton`

Components must be reusable but not over-generalized. Keep domain logic
out of presentational components.

------------------------------------------------------------------------

## 12. Interaction states and validation standards

Every interactive page must define:

-   Initial loading.
-   Background refresh where relevant.
-   Empty state.
-   No search/filter results.
-   Validation error.
-   API/server error.
-   Success confirmation.
-   Disabled state.
-   Permission/unauthorized state.
-   Offline or retry state where relevant.

Forms: - Label every input. - Show required/optional status. - Validate
on blur and submit without noisy premature errors. - Preserve
user-entered values after recoverable errors. - Explain how to fix an
error. - Disable duplicate submissions while pending. - Confirm
destructive actions. - Warn before navigating away from unsaved edits.

Tables: - Define sorting, filtering, pagination, and empty states. -
Preserve filters when returning from a record detail page where
practical. - Provide clear bulk-action feedback.

------------------------------------------------------------------------

## 13. Accessibility and usability

Target WCAG 2.2 AA where practical.

Requirements: - Semantic HTML. - Keyboard navigation. - Visible focus
indicators. - Sufficient colour contrast. - Accessible form labels and
error messages. - Alternative text for meaningful images. -
Captions/transcripts for meaningful video content where required. -
Reduced-motion support. - Focus management for dialogs and drawers. -
Screen-reader status announcements for cart and form updates. - Touch
targets suitable for mobile. - Do not communicate status using colour
alone.

------------------------------------------------------------------------

## 14. Security, privacy, and trust requirements

-   Enforce authorization on the server, not only by hiding frontend
    routes.
-   Separate customer and owner authentication/authorization.
-   Use secure, HTTP-only, SameSite cookies where appropriate; protect
    state-changing requests against CSRF if cookie-based auth is used.
-   Hash OTP/session-related secrets appropriately; OTPs must expire and
    be rate-limited.
-   Do not store raw card details.
-   Verify payment webhooks server-side and make webhook handling
    idempotent.
-   Validate and sanitize user input.
-   Validate uploaded media type, size, and content.
-   Use secure secret storage for payment and shipping credentials.
-   Apply rate limits to login, OTP, search, reviews, and contact forms.
-   Log security-relevant events without logging secrets or OTP values.
-   Minimize personal data collection.
-   Do not persist height and weight from the size suggestion by
    default.
-   Provide clear privacy information and account support/deletion
    process.
-   Restrict customer data exports and protect downloaded reports.
-   Keep an audit trail for admin changes to products, prices, stock,
    orders, refunds, policies, and CMS content.

------------------------------------------------------------------------

## 15. Functional and non-functional requirements

### 15.1 Functional requirements

**Catalogue** - Admin can create, update, publish, unpublish, and
archive products. - Products support configurable departments,
categories, collections, media, sizes, colours, and variants. -
Inventory is tracked at variant level. - Customers can browse, search,
sort, and filter published products.

**Customer** - Customers authenticate using mobile OTP. - Customers can
maintain profiles and multiple addresses. - Customers can save wishlist
items. - Customers can create and manage carts. - Customers can checkout
using enabled payment methods. - Customers can view order history and
status. - Customers can submit eligible return/exchange requests and
reviews.

**Payments** - Payment methods are configurable. - Payment result is
verified server-side. - Payment/order transitions are idempotent. - COD
rules are configurable.

**Admin** - Owner can manage catalogue, stock, orders, returns,
customers, reviews, promotions, CMS, settings, and analytics. - Owner
can preview and publish homepage changes. - Owner can export permitted
reports. - Owner actions are audited.

**Size suggestion** - Customer can enter height and weight in supported
units. - System uses product-specific validated sizing rules. - Customer
can override recommendation. - No recommendation is fabricated when data
is insufficient.

### 15.2 Non-functional requirements

-   Responsive on current mobile and desktop browsers.
-   Optimize image delivery and page loading.
-   Use pagination or incremental loading for large catalogues.
-   Avoid layout shifts with image dimensions/aspect ratios.
-   Use server-side validation for all business-critical operations.
-   Maintain consistent INR formatting.
-   Ensure order and inventory operations are concurrency-safe.
-   Provide actionable error handling.
-   Keep the codebase modular and maintainable.
-   Monitor application errors and payment/shipping integration health.

------------------------------------------------------------------------

## 16. Suggested frontend route map

### Customer app

  Route                               Page
  ----------------------------------- -------------------------
  `/`                                 Homepage
  `/men`                              Men department
  `/women`                            Women department
  `/category/:slug`                   Category listing
  `/collection/:slug`                 Collection listing
  `/search`                           Search results
  `/product/:slug`                    Product detail
  `/wishlist`                         Wishlist
  `/cart`                             Cart
  `/checkout`                         Checkout
  `/order-confirmation/:orderId`      Order confirmation
  `/login`                            Mobile login
  `/verify-otp`                       OTP verification
  `/account`                          Account dashboard
  `/account/profile`                  Profile
  `/account/addresses`                Address book
  `/account/orders`                   Order history
  `/account/orders/:orderId`          Order detail
  `/account/orders/:orderId/return`   Return/exchange request
  `/account/reviews`                  Customer reviews
  `/about`                            About Hestola
  `/contact`                          Contact
  `/faq`                              FAQ
  `/policies/:slug`                   Policy page
  `*`                                 Not found

### Admin app

  Route                             Page
  --------------------------------- -----------------------
  `/admin/login`                    Owner login
  `/admin`                          Overview
  `/admin/products`                 Product list
  `/admin/products/new`             Create product
  `/admin/products/:id/edit`        Edit product
  `/admin/categories`               Categories
  `/admin/collections`              Collections
  `/admin/inventory`                Inventory
  `/admin/orders`                   Orders
  `/admin/orders/:id`               Order detail
  `/admin/returns`                  Returns and exchanges
  `/admin/customers`                Customers
  `/admin/customers/:id`            Customer detail
  `/admin/reviews`                  Reviews moderation
  `/admin/marketing/coupons`        Coupons
  `/admin/marketing/campaigns`      Campaigns
  `/admin/content/homepage`         Homepage CMS
  `/admin/content/banners`          Banners
  `/admin/content/announcement`     Announcement bar
  `/admin/content/pages`            Pages and policies
  `/admin/analytics`                Analytics
  `/admin/reports`                  Reports
  `/admin/settings/store`           Store settings
  `/admin/settings/shipping`        Shipping settings
  `/admin/settings/payments`        Payment settings
  `/admin/settings/notifications`   Notifications
  `/admin/settings/policies`        Policy configuration
  `/admin/settings/security`        Owner security

Routes may be refined during implementation, but page responsibilities
must remain clear.

------------------------------------------------------------------------

## 17. Suggested data-domain map

This is a conceptual model, not a final database schema.

-   **AdminUser:** single owner identity, authentication metadata,
    security events.
-   **Customer:** name, verified mobile, optional email, account status,
    timestamps.
-   **Address:** customer reference, recipient, address fields, default
    flag.
-   **Product:** name, slug, descriptions, department, category,
    collections, media, attributes, status.
-   **ProductVariant:** product reference, size, colour, SKU, price
    override, stock state.
-   **SizeChart:** applicable product/category, measurement rows, units,
    fit notes.
-   **SizeRecommendationRule:** versioned product/category sizing
    configuration and supported inputs.
-   **Category:** name, slug, hierarchy, media, active state, sort
    order.
-   **Collection:** name, slug, description, media, product assignments,
    schedule.
-   **Cart:** customer reference, line items, variant references,
    quantity.
-   **Wishlist:** customer reference, product references.
-   **Order:** customer snapshot, address snapshot, line-item snapshots,
    totals, order status.
-   **Payment:** order reference, gateway reference, amount, status,
    method, webhook events.
-   **Shipment:** order reference, provider, tracking reference,
    status/events.
-   **ReturnRequest:** order/item references, reason, type, status,
    evidence, decision history.
-   **Coupon:** code, rules, eligibility, usage counters, schedule.
-   **Review:** customer/product/order references, rating, content,
    moderation status.
-   **InventoryMovement:** variant, delta, reason, source reference,
    actor, timestamp.
-   **ContentPage / HomepageLayout:** published and draft content,
    sections, media, schedule.
-   **Banner / Campaign / Announcement:** content, placement,
    destination, schedule, status.
-   **StoreSettings:** currency, timezone, contact, social links,
    operational configuration.
-   **PolicyConfiguration:** effective policy rules and customer-facing
    content.
-   **AuditLog:** actor, action, target, before/after metadata,
    timestamp.

Important data rules: - Store money in integer minor units (paise) or a
consistent decimal strategy; never use floating-point arithmetic for
payment totals. - Store order item name, SKU, variant, price, discount,
and tax snapshots so historical orders remain accurate after product
edits. - Use indexes for product slug, SKU, order number, customer
mobile, and frequently filtered status/date fields. - Use transactions
or equivalent consistency controls for order/payment/inventory workflows
where supported. - Keep uploaded media outside MongoDB document
payloads; store durable media references and metadata.

------------------------------------------------------------------------

## 18. Technical implementation constraints

-   Use JavaScript and JSX only. Do not introduce TypeScript, `.ts`, or
    `.tsx`.
-   React + Vite for the frontend.
-   Node.js + Express for the API.
-   MongoDB + Mongoose for persistence.
-   Organize code by feature/domain rather than placing all logic in
    large files.
-   Separate routes, controllers, services, models, validation, and
    middleware on the backend.
-   Use reusable UI components and page-level composition on the
    frontend.
-   Keep API calls in service modules.
-   Keep authentication and authorization checks centralized.
-   Keep payment, shipping, SMS/OTP, media, and analytics integrations
    behind service adapters so providers can be selected later.
-   Use environment variables for secrets and environment-specific
    settings.
-   Provide `.env.example` with placeholders only.
-   Never commit credentials or production secrets.
-   Include seed data only for local development and mark it clearly as
    demo data.

------------------------------------------------------------------------

## 19. Acceptance criteria

The design is ready for implementation when:

1.  Every route in the route map has a defined purpose and page layout.
2.  All page sections and actions have defined behaviour.
3.  Customer and owner navigation are documented.
4.  Mobile and desktop behaviour is defined.
5.  Product variants and variant-level inventory are supported.
6.  The size suggestion flow includes clear limitations and manual
    override.
7.  Login uses mobile OTP and guest checkout is unavailable.
8.  Checkout supports configured Indian payment methods.
9.  Shipping provider can be selected later without redesigning the
    checkout.
10. Returns, exchanges, and refunds have an end-to-end workflow.
11. Owner can manage storefront homepage content without code changes.
12. Loading, empty, error, success, and validation states are included.
13. Security, privacy, and audit requirements are addressed.
14. The existing Hestola logo, tagline, and colour palette are
    respected.
15. No unconfirmed category, policy, shipping provider, or business
    claim is hard-coded.

------------------------------------------------------------------------

## 20. Open decisions to resolve during implementation

These items are deliberately not invented:

-   Final launch category and subcategory list.
-   Exact size labels and product-specific size charts.
-   Validated height/weight recommendation data and fit-preference
    rules.
-   Payment gateway provider and production credentials.
-   Shipping aggregator / courier provider.
-   Shipping fees, delivery promises, COD rules, and serviceability.
-   Return, exchange, cancellation, and refund policy details.
-   GST and invoice requirements.
-   Customer notification providers and channels.
-   Final domain names and deployment environment.
-   Approved brand photography, About-page copy, contact details, and
    legal content.
-   Whether newsletter signup and social gallery are enabled.
-   Whether product reviews are enabled at launch.

These decisions should be captured in configuration and implementation
tickets when confirmed.

------------------------------------------------------------------------

## 21. Final design direction

Hestola should look and behave like a considered fashion label, not a
generic store template.

The storefront should be expressive through imagery, typography,
composition, and product storytelling while keeping shopping tasks fast
and predictable. The admin should be visually consistent but
operationally focused. The supplied burnt-orange, near-black, ivory, and
warm-grey palette is the foundation. The logo and "WEAR YOUR IDENTITY"
tagline remain the brand anchors.

**Primary principle:** Brand expression should improve product discovery
and trust; it must never obstruct the customer's ability to understand
fit, price, availability, delivery, or return conditions.
