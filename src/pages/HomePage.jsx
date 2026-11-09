import SiteHeader from '@/components/layout/SiteHeader'

// The storefront ("Explore Hestola" from the landing page). Its design comes next.
// The clothing rail (src/components/home/HeroRail.jsx) is hidden for now; it will hang in the
// landing room as the new drop.
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main />
    </>
  )
}
