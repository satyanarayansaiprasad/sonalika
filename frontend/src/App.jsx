import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home';
import TeamLogin from './Components/TeamLogin';
import SalesTeamDashboard from './Components/SalesTeamDashboard';
import AdminDashboard from './Components/AdminDashboard';
import ProductionTeam from './Components/ProductionTeam';
import AccountsDashboard from './Components/AccountsDashboard';
import ProtectedRoute from './Components/ProtectedRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route  path='/spteamlogin'  element={
          <ProtectedRoute allowedRoles={["team"]}>
            <TeamLogin />
          </ProtectedRoute>
        }/> */}

       
        <Route  path='/spteamlogin'  element={
          <ProtectedRoute allowedRoles={["team"]}>
            <TeamLogin />
          </ProtectedRoute>
        }/>
       <Route path='/admindashboard'  element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }/> 
         {/* <Route path='/admindashboard'  element={
          
            <AdminDashboard />
         
        }/> */}
      <Route  path='/salesteamdashboard' element={
        <ProtectedRoute allowedRoles={["team"]}>
        <SalesTeamDashboard/>
        </ProtectedRoute>
        }/>
      <Route  path='/productiondashboard' element={<ProductionTeam/>}/>
      <Route  path='/accountsdashboard' element={
        <ProtectedRoute allowedRoles={["accounts"]}>
          <AccountsDashboard/>
        </ProtectedRoute>
      }/>
      {/* Add more routes here when needed */}
    </Routes>
  );
};

export default App;
