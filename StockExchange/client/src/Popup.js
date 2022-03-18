import React from "react";

import "./style/popup.css"
import "./style/mytable.css"

export default class Popup extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isOpen: false
        }

        this.handleOpenButton = this.handleOpenButton.bind(this);
        this.handleCloseButton = this.handleCloseButton.bind(this);
    }

    handleOpenButton(){
        this.setState({isOpen: true})
    }

    handleCloseButton(){
        this.setState({isOpen: false})
    }

    render() {
        if(!this.props.content) return null;
        let tabledata = this.props.content.map((data) => (
            <tr key={data.id}>
                <td>{data.name}</td>
                <td>{data.amount}</td>
                <td>{data.auction_amount}</td>
            </tr>
        ))
        return (
            <React.Fragment>
                <button onClick={this.handleOpenButton}>{this.props.button}</button>
                {this.state.isOpen ?
                    (<div className="blackout">
                        <div className='popup'>
                            <h3 className="header">{this.props.header}</h3>
                            <div className="content">
                                    <table>
                                        <thead>
                                            <th>Название акции</th>
                                            <th>Количество</th>
                                            <th>Выставленное на аукцион</th>
                                        </thead>
                                        <tbody>
                                            {tabledata}
                                        </tbody>
                                    </table>
                            </div>
                            <button className="closeButton" onClick={this.handleCloseButton}>Закрыть</button>
                        </div>
                    </div>) : null
                }
        </React.Fragment>
        )
    }

}




