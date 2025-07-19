import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm]= useState({
    customerId:"",
    month:"",
    amount:"",
  });

  const handleChange = (e)=>{
    setForm({...form, [e.target.name]:e.target.value});
  };
  

}

export default App
