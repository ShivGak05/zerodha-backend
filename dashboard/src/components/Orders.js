import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useState,useEffect } from "react";
const Orders = () => {
  const [orders,setOrders]=useState([]);
  useEffect(()=>{
    axios.get('http://localhost:3002/allOrders').then((res)=>{
      setOrders(res.data);
    })
  },[])
   return(
        <>
        <h3 className="title">Orders ({orders.length})</h3>
        <div className="order-table">
            <table>
                <tr>
                    <th>Name</th>
                   
                    <th>Oty.</th>
                    
                    <th>Price</th>
                   
                    <th>Mode</th>
                </tr>
                {orders.map((stock,index)=>{
               
                    return(
                        <tr key={index}>
                        
                            <td>{stock.name}</td>
                            <td>{stock.qty}</td>
                            
                            <td>{stock.price.toFixed(2)}</td>
                            <td>{stock.mode}</td>

                        </tr>
                    );
                })}
            </table>
        </div>
        </>
    );
}
export default Orders;