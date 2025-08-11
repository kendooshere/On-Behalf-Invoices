import React, { useState } from 'react'
import brands from '../../data/brands.json';
import BrandSelection from './components/BrandSelection';
import CustomerSelection from './components/CustomerSelection';
import DateSelection from './components/DateSelection';


function App() {
  const [formData, setFormData] = useState({
    brandId: '',
    customersList: [],
    month: '',
    amount: '',
  });


  function handleOnChange(e) {
    const { name, value } = e.target;
    setFormData(function (prev) {
      return {
        ...prev, [name]: value,
      }
    });
    // console.log(currentBrand);
  }

  function handleCustomerToggle(customerId) {
    setFormData((prev) => {
      const alreadyChecked = prev.customersList.includes(customerId);
      return {
        ...prev,
        customersList: alreadyChecked
          ? prev.customersList.filter((id) => id !== customerId)
          : [...prev.customersList, customerId],
      };
    });

  }

  async function handleSubmit(e) {
    e.preventDefault();

    console.log(formData);

    // const res = await fetch("http://localhost:3000/generate-invoice", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(formData)
    // });
  }

  const currentBrand = brands.find(b => b.brandId == formData.brandId);



  return (

    <>
      <form onSubmit={handleSubmit}>
        <BrandSelection brands={brands} handleChange={handleOnChange} selectedBrand={formData.brandId} onSubmit={handleSubmit} />
        <CustomerSelection currentBrand={currentBrand} formData={formData} handleCustomerToggle={handleCustomerToggle}/>
        <DateSelection formData={formData} handleChange={handleOnChange} />
        <button type="submit">Submit</button>
      </form>

      <p>Selected Month: {formData.month}</p>

    </>

  );


}

export default App;