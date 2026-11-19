import SiteHeader from "@/components/SiteHeader";
import PhotoHero from "@/components/hero/PhotoHero";
import PawRibbon from "@/components/ribbon/PawRibbon";
import ShopByPet from "@/components/shop/ShopByPet";
import PetFavourites from "@/components/favourites/PetFavourites";
import HappyPawsClub from "@/components/club/HappyPawsClub";
import SiteFooter from "@/components/footer/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PhotoHero />
        <PawRibbon />
        <ShopByPet />
        <PetFavourites />
        <HappyPawsClub />
      </main>
      <SiteFooter />
    </>
  );
}
