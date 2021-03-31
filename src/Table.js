import axios from "axios";
import { Component } from "react";
import Craft from "./Craft";

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = { crafts: [], prices: [], module: "" };
  }

  componentDidMount() {
    axios("http://localhost:5000/crafts").then((result) => {
      console.log("crafts: ", result);
      this.setState({
        crafts: result.data,
      });
    });
    axios("http://localhost:5000/prices").then((result) => {
      console.log("prices: ", result);
      this.setState({
        prices: result.data,
      });
    });
  }

  filter(e) {
    this.setState({ module: e.target.value });
  }

  render() {
    const crafts = this.state.crafts.filter((craft) =>
      craft.module.includes(this.state.module)
    );
    return (
      <div>
        <select value={this.state.module} onChange={(e) => this.filter(e)}>
          <option default value="">
            All
          </option>
          <option value="Booze">Booze</option>
          <option value="Intelligence">Intelligence</option>
          <option value="Lav">Lav</option>
          <option value="Meds">Meds</option>
          <option value="Nutrition">Nutrition</option>
          <option value="Water">Water</option>
          <option value="Workbench">Workbench</option>
        </select>
        {crafts &&
          crafts.map((craft, i) => (
            <Craft key={i} craft={craft} prices={this.state.prices} />
          ))}
      </div>
    );
  }
}

export default Table;
