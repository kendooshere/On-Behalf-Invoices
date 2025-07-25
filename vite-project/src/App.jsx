import React, { useState } from 'react'
import brands from '../../data/brands.json';
import BrandSelection from './components/BrandSelection';
import CustomerSelection from './components/CustomerSelection';
import DateSelection from './components/DateSelection';


function App() {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [formData, setFormData] = useState({
    brandId:"",
    month:"",
    amount:"",
  });

  
  function handleOnChange(e) {
    setFormData(function (prev){
      return{
        ...prev, [e.target.name]:e.target.value
      };
    });
    // console.log(currentBrand);
  }

  async function handleSubmit(e){
      e.preventDefault();
  }
  
  const currentBrand = brands.find(b => b.brandId === formData.brandId);



  return (

    <>
      <BrandSelection brands={brands} handleChange={handleOnChange} selectedBrand={formData.brandId} onSubmit={handleSubmit} />
      <CustomerSelection currentBrand={currentBrand} />
      <DateSelection/>      
    </>

  );


}

export default App;