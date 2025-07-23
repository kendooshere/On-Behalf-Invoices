export default function DateSelection() {
  return (
    <>
      <label name="invoice-month">
        Invoice Month
        <input type="month" name="date" id="invoice-date" />
      </label>
      <label name="invoice-amount">Amount
        <input type="text" /></label>
    </>
  );
}