import React from "react";
import { compose, withProps } from "recompose";
import { withScriptjs } from "react-google-maps";
import { StandaloneSearchBox } from "react-google-maps/lib/components/places/StandaloneSearchBox";
import { Input } from 'antd';

export default compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places",
    loadingElement: (<div style={{ height: `100%` }} />),
    containerElement: (<div style={{ height: `100px` }} />),
  }),
  withScriptjs
)(({ onSearchBoxMounted, onPlacesChanged, defaultValue}) =>
  (
    <div data-standalone-searchbox="">
      <StandaloneSearchBox
        ref={onSearchBoxMounted}
        onPlacesChanged={onPlacesChanged}
      >
        <Input placeholder="Customized your placeholder" defaultValue={defaultValue}/>
      </StandaloneSearchBox>
  </div>
  )
);
