

import Navbar from 'react-bootstrap/Navbar';

import logo from '../logo.png';

import NavDropdown from 'react-bootstrap/NavDropdown';

const Navigation = () => {
    return(        
    <Navbar>
        <img alt="logo" src={logo} width="40" height="40" className="d-inline-block align-top mx-3"/>
        <Navbar.Brand href='#'>Sobek ICO Crowdsale</Navbar.Brand>
    </Navbar>   
    )
}

export default Navigation;
