import React from 'react';

import './BookList.scss';

interface IBookItemProps {}

interface IBookItemState {
  folded: boolean;
}

class BookListItem extends React.Component<IBookItemProps, IBookItemState> {
  constructor(props: any) {
    super(props);

    this.state = {
      folded: true
    };

    this.toggleFold.bind(this);
  }

  toggleFold(e: any) {
    this.setState((state: IBookItemState) => ({
      folded: !state.folded
    }));
    e.preventDefault();
  }

  render() {
    let isFolded: boolean = this.state.folded;

    return (
      <div className="book-block" onClick={(e) => this.toggleFold(e)}>
        <div className="book-img">
          <div className="book-stencil"></div>
        </div>
        <div className="book-desc">
          <h1 className="book-title">Title of the Book</h1>
          <h2 className="book-authors">Author1, Author2, Author3</h2>
          <h3 className="book-id">ISBN: 123456789123456</h3>
          <h4 className="book-tags">
            <div className="book-tag">tag1</div>
            <div className="book-tag">tag2</div>
            <div className="book-tag">tag3</div>
          </h4>
          {!isFolded && (
            <p className="book-abstract">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
              posuere elit pharetra semper elementum. Duis felis purus,
              elementum eu molestie ac, malesuada lobortis velit. Sed felis
              libero, blandit vel consectetur venenatis, egestas at nisi.
              Curabitur tristique euismod nisl a scelerisque. In id purus dolor.
              Vivamus eu suscipit ipsum. Nullam ut tellus viverra, malesuada
              risus ut, fringilla diam. Duis tincidunt ex.
            </p>
          )}
        </div>
        <div className="book-req-btn">
          <button>Borrow</button>
          <span>In shelf</span>
          <div className="book-qty">4 nos</div>
        </div>
      </div>
    );
  }
}

export default class BookList extends React.Component {
  render() {
    return (
      <div className="book-list">
        <BookListItem />
        <BookListItem />
        <BookListItem />
        <BookListItem />
      </div>
    );
  }
}
