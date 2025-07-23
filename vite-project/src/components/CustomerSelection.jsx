
export default function CustomerSelection({ currentBrand }) {
  return (
    <>
    {
      currentBrand && currentBrand.customers && (
      <>
        <h2>Customers for {currentBrand.reg_name}:</h2>
        {currentBrand.customers.map(customer => (
          <div><br />
            <label key={customer.id}>
              <input type="checkbox" name={customer.customer_name} id={customer.id} checked="true" />{customer.customer_name}({customer.unit})
            </label>
          </div>
        ))}
      </>
    )
  }
  </>
);
}

