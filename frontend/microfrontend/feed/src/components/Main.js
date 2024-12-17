import React, {lazy} from 'react';
import api from "../utils/api";
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import AddPlacePopup from "./AddPlacePopup";
import Card from './Card';
import ImagePopup from "./ImagePopup";
import "../index.css";

const Profile = lazy(() => import('profile/Profile').catch(() => {
        return {default: () => <div className='error'>Component is not available!</div>};
    })
);

function Main() {
    const [cards, setCards] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState({});
    const [selectedCard, setSelectedCard] = React.useState(null);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);

    React.useEffect(() => {
        api
            .getAppInfo()
            .then(([cardData, userData]) => {
                setCurrentUser(userData);
                setCards(cardData);
            })
            .catch((err) => console.log(err));
    }, []);

    function handleCardLike(card) {
        const isLiked = card.likes.some((i) => i._id === currentUser._id);
        api
            .changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((cards) =>
                    cards.map((c) => (c._id === card._id ? newCard : c))
                );
            })
            .catch((err) => console.log(err));
    }

    function handleCardDelete(card) {
        api
            .removeCard(card._id)
            .then(() => {
                setCards((cards) => cards.filter((c) => c._id !== card._id));
            })
            .catch((err) => console.log(err));
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function handleAddPlaceSubmit(newCard) {
        api
            .addCard(newCard)
            .then((newCardFull) => {
                setCards([newCardFull, ...cards]);
                closeAllPopups();
            })
            .catch((err) => console.log(err));
    }

    function closeAllPopups() {
        setIsAddPlacePopupOpen(false);
        setSelectedCard(null);
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <main className="content">
                <Profile currentUser={currentUser} setCurrentUser={setCurrentUser}>
                    <button className="places__add-button" type="button"
                            onClick={handleAddPlaceClick}></button>
                </Profile>
                <section className="places page__section">
                    <ul className="places__list">
                        {cards.map((card) => (
                            <Card
                                key={card._id}
                                card={card}
                                onCardClick={handleCardClick}
                                onCardLike={handleCardLike}
                                onCardDelete={handleCardDelete}
                            />
                        ))}
                    </ul>
                </section>
                <ImagePopup card={selectedCard} onClose={closeAllPopups}/>
                <AddPlacePopup
                    isOpen={isAddPlacePopupOpen}
                    onAddPlace={handleAddPlaceSubmit}
                    onClose={closeAllPopups}
                />
            </main>
        </CurrentUserContext.Provider>
    );
}

export default Main;
