import React from "react";

import "./style/login.css"

export default class Login extends React.Component{
    constructor(props) {
        super(props);
        this.handleClickSubmit = this.handleClickSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleClickSubmit(){
        this.props.clickSubmit();
    }

    handleChange(e){
        this.props.onValueChange(e.target.value)
    }

    render(){
        return(
            <div className="login">
                <p>Введите своё имя</p>
                <div className="inputForm">
                    <input type="text" name="username" onChange={this.handleChange}/>
                    <button onClick={this.handleClickSubmit}> Войти </button>
                </div>
            </div>
        )
    }
}