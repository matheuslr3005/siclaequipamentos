import { BuildExperience } from "@/components/BuildExperience";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Process } from "@/components/Process";
import { Products } from "@/components/Products";
import { Quality } from "@/components/Quality";
import { Reveals } from "@/components/Reveals";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Steps } from "@/components/Steps";

const Band = () => <div className="plate-band" aria-hidden />;

const Page = () => (
  <>
    <SmoothScroll />
    <Header />
    <main>
      <BuildExperience />
      <Band />
      <Products />
      <Steps />
      <Process />
      <Quality />
      <Band />
      <Contact />
    </main>
    <Footer />
    <Reveals />
  </>
);

export default Page;
