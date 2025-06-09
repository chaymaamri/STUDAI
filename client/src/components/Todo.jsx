import React from 'react';
import './TextUp.css'; // Assurez-vous que le chemin est correct
import timetables from './todo.png';

const Todo = () => {
    return (
        <div className="textup-container">
            <div className="container1">
                <img src={timetables} alt="Timetables" className="image" />
                <h1 className="texte">Ecrire vos todo</h1>
            </div>
        </div>
    );
    
};

export default Todo;