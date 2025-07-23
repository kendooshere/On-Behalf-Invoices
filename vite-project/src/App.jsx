import React, { useState } from 'react'
import brands from '../../data/brands.json';
import BrandSelection from './components/BrandSelection';
import CustomerSelection from './components/CustomerSelection';
import DateSelection from './components/DateSelection';


function App() {
  const [selectedBrand, setSelectedBrand] = useState('');

  function handleOnChange(e) {
    setSelectedBrand(e.target.value);
    // console.log(currentBrand);
  }

  const currentBrand = brands.find(b => b.brandId === selectedBrand);



  return (

    <>
      <BrandSelection brands={brands} handleChange={handleOnChange} selectedBrand={selectedBrand} />
      <CustomerSelection currentBrand={currentBrand} />
      <DateSelection/>      
    </>

  );


}

export default App;