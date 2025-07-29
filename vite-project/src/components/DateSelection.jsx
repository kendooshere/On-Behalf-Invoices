export default function DateSelection({formData}) {
  return (
    <>
      <label name="invoice-month">
        Invoice Month
        <input type="month" name="date" id="invoice-date" value={formData.month} />
      </label>
      <label name="invoice-amount">Amount
        <input type="text" /></label>
    </>
  );
}