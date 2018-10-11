class mya extends React.Component {
	render() {
		return React.createElement('a',
			//{href: this.props.dal+`author=${this.props.author}&quizid=${this.props.qid}&page`},
			{href: `../${this.props.author}/${this.props.qid}?folder=${this.props.folder}&lti=${encodeURIComponent(this.props.lti)}`},
			'Quiz' + this.props.qid + ' : ' + (100*this.props.grade).toFixed(1)+'%');
	}
}
class mygradea extends React.Component {
	render() {
		return React.createElement('a',{href: this.props.dal+`author=${this.props.author}&folder=${this.props.folder}&grades`},
		'Overall : '+(100*this.props.grade).toFixed(1)+'%');
	}
}
class myul extends React.Component {
	render() {
		var lis = this.props.qids.map((qid,i)=>React.createElement(mylia,{...this.props,qid,key:i,grade:this.props.grades[i]}));
		lis.push(React.createElement(mygradea,{...this.props,key:-1}));
		return React.createElement('ul',null,lis);
	}
}
class mylia extends React.Component {
	render() { return React.createElement('li', null, React.createElement(mya,this.props)); }
}

//var mylia = React.createClass({
//	render : function() { return React.createElement('li', null, React.createElement(mya,this.props)); }
//});
