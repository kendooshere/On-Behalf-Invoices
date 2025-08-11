
export default function CustomerSelection({ currentBrand, handleChange, handleCustomerToggle }) {
  if (!currentBrand) return null;

    return (
    <>
    {
      currentBrand && currentBrand.customers && (
      <>
        <h2>Customers for {currentBrand.reg_name}:</h2>
        {currentBrand.customers.map(customer => (
          <div key={customer.id}><br />
            <label htmlFor={customer.customer_name}>
              <input type="checkbox" name="customersList" id={customer.customer_name} value={customer.id} onChange={handleCustomerToggle(customer.id)} />{customer.customer_name}({customer.unit})
            </label>
          </div>
        ))}
      </>
    )
  }
  </>
);
}

