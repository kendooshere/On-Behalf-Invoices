
export default function CustomerSelection({ currentBrand, handleChange, handleCustomerToggle }) {
  const today = new Date();

    const activeCustomers = currentBrand?.customers?.filter(customer =>{
      return new Date(customer.lease_expiry)>=today;
    });

    return (
    <>
    {
      currentBrand && activeCustomers.length> 0  && (
      <>
        <h2>Active Customers for {currentBrand.reg_name}:</h2>
        {activeCustomers.map(customer => (
          <div key={customer.id}><br />
            <label htmlFor={customer.customer_name}>
              <input type="checkbox" name="customersList" id={customer.customer_name} value={customer.id} onChange={()=> handleCustomerToggle(customer.id)} />{customer.customer_name} ({customer.unit}) - Share:{customer.share}%
            </label>
          </div>
        ))}
      </>
    )
  }
  </>
);
}

