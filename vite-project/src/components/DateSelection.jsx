export default function DateSelection({formData, handleChange}) {
  return (
    <>
      <label htmlFor="invoice-month">
        Invoice Month
        <input type="month" name="month" id="invoice-month" value={formData.month} onChange={handleChange} />
      </label>
      <label htmlFor="invoice-amount">Amount
        <input type="text" name="amount" id="invoice-amount" value={formData.amount} onChange={handleChange} /></label>
    </>
  );
}