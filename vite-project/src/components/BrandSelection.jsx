export default function BrandSelection({brands, handleChange, selectedBrand}) {
  return (
    <>
      <select onChange={handleChange} value={selectedBrand}>
        {
          brands.map(brand => (
            <option key={brand.brandId} value={brand.brandId}>{brand.reg_name}</option>
          ))
        }
      </select>
    </>
  );
}
