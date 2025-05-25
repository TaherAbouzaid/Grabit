//clone https://grabit-react-next.maraviyainfotech.com/home/

import React from "react";
import HeroSlider from "../components/HeroSlider";
import DealendTimer from "../components/DealendTimer";
import DiscountedProductsSlider from "../components/DiscountedProductsSlider";
import Banner from "../components/Banner";
import NewArrivals from "../components/NewArrivals";
import TwoBanners from "../components/TwoBanners";
import FeaturesRow from "../components/FeaturesRow";
import ProductsShowcaseSection from "../components/ProductsShowcaseSection";
import CategorySlider from "../components/CategorySlider";
import PostSliderHome from "../components/PostSliderHome";
// import ProductContainer from '../components/ProductContainer';

const Home = () => {
  return (
    <>
      <HeroSlider />
      <CategorySlider />
      <DealendTimer />
      <div
        data-aos="fade-up"
        data-aos-once="true"
        data-aos-anchor-placement="top-"
        data-aos-delay="0"
        data-aos-duration="1000"
        data-aos-offset="300"
      >
        <DiscountedProductsSlider />
      </div>
      <Banner />
      <NewArrivals />
      <TwoBanners />
      <div
        data-aos="fade-up"
        data-aos-once="true"
        data-aos-anchor-placement="bottom-bottom"
        data-aos-delay="50"
        data-aos-duration="2000"
        data-aos-offset="300"
      >
        <FeaturesRow />
      </div>
      <div
        data-aos="fade-up"
        data-aos-once="true"
        data-aos-anchor-placement="bottom-bottom"
        data-aos-delay="100"
        data-aos-duration="2000"
        data-aos-offset="300"
      >
        <ProductsShowcaseSection />
      </div>
      <div
        data-aos="fade-up"
        data-aos-once="true"
        data-aos-anchor-placement="bottom-bottom"
        data-aos-delay="100"
        data-aos-duration="2000"
        data-aos-offset="300"
      >
        <PostSliderHome />
      </div>
      {/* <ProductContainer /> */}
    </>
  );
};

export default Home;
