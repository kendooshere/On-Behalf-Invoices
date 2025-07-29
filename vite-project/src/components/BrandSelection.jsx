export default function BrandSelection({brands, handleChange, selectedBrand}) {
  return (
    <>
      <select name ="brandId" onChange={handleChange} value={selectedBrand}>
        <option value="">Select A Brand</option>
        {
          brands.map(brand => (
            <option key={brand.brandId} value={brand.brandId}>{brand.reg_name}</option>
          ))
        }
      </select>
    </>
  );
}
