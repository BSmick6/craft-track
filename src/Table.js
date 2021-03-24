import axios from "axios";
import { Component } from "react";

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = { crafts: null };
  }

  componentDidMount() {
    axios("http://localhost:3001/").then((result) => {
      this.setState({
        crafts: result.data,
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.crafts
          ? this.state.crafts.map((craft, i) => (
              <div key={i}>{craft.product.name}</div>
            ))
          : null}
      </div>
    );
  }
}

export default Table;
