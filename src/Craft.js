import { Component } from "react";

class Craft extends Component {
  render() {
    return (
      <div className="craft">
        {this.props.craft.ingredients.map((ingredient, i) => (
          <span key={i}>
            <img src={ingredient.icon} alt={ingredient.name} />$
            {this.props.prices[ingredient.name]}x{ingredient.quantity}=$
            {this.props.prices[ingredient.name] * ingredient.quantity}
          </span>
        ))}
        <big>=></big>
        <img
          src={this.props.craft.product.icon}
          alt={this.props.craft.product.name}
        />
        x{this.props.craft.product.quantity}
        <span>${this.props.prices[this.props.craft.product.name]}</span>
        <span>${this.props.craft.profitRate}/hr</span>
      </div>
    );
  }
}

export default Craft;
