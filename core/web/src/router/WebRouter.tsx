import React from "react";
import {Routes, Route} from "react-router-dom";
import LandingLayout from "../layouts/landingLayout";
import Home from "../pages/Home";


export default function WebRouter(){
  const loadLayout = (Layout: any, Page: any) => {
    return(
      <Layout>
        <Page />
      </Layout>
    );
  }


  return(
    <Routes>
      <Route path="/" element={loadLayout(LandingLayout, Home)} />
    </Routes>
  );
}
