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
import { Link } from "react-router-dom";
// import ProductContainer from "../components/ProductContainer";
const Home = () => {
  return (
    <>
    <Link to="/shop">shop
    </Link>
      <HeroSlider />
      <CategorySlider />
      <DealendTimer />
      <DiscountedProductsSlider />
      <Banner />
      <NewArrivals />
      <TwoBanners />
    <FeaturesRow/>
    <ProductsShowcaseSection />
    {/* <ProductContainer /> */}
    </>
  );
};

export default Home;
