export default function brandSelect({handleOnChange, selectedBrand}) {
  return (
    <>
      <select onChange={handleOnChange} value={selectedBrand}>
        {
          brands.map(brand => (
            <option key={brand.brandId} value={brand.brandId}>{brand.reg_name}</option>
          ))
        }
      </select>
    </>
  );
}
