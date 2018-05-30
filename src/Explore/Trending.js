import React, { Component } from "react";
import { hot } from "react-hot-loader";
import Post from ".././Components/Post/";
import steemVote from ".././Functions/steemVote";
//import getTrendingPosts from '.././Functions/getTrendingPosts'
import Masonry from "react-masonry-css";
import Spinner from ".././Components/Spinner";
import Waypoint from "react-waypoint";

import styled from "styled-components";
//REDUX
import { connect } from "react-redux";
import {
  getUserFollowing,
  getProfileVotes,
  getSteemTrendingPosts
} from ".././actions/steemActions";
import {
  postFollowingToState,
  postVoteToState,
  removeVoteFromState
} from "../actions/stateActions";

import store from ".././store";
import { transparent } from "material-ui/styles/colors";
const Container = styled.div`
  box-sizing: border-box;
  padding-left: 10%;
  padding-right: 10%;
  margin-top: 6em;
  position: relative;
  @media (max-width: 1024px) {
    margin-top: 7em;
  }
  @media (max-width: 768px) {
    margin-top: 6em;
  }
  @media (max-width: 425px) {
    padding-left: 0;
    padding-right: 0;
    margin-top: 4.5em;
  }
  @media (max-width: 375px) {
  }
`;

class Trending extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fetchingData: true,
      posts: [],
      items: store.getState(),
      shouldLoad: false,
      innerWidth: window.innerWidth
    };

    this.updateVotingState = this.updateVotingState.bind(this);
    this.loadMorePosts = this.loadMorePosts.bind(this);
    this.handleVoting = this.handleVoting.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.renderWaypoint = this.renderWaypoint.bind(this);
  }
  async loadMorePosts() {
    if (
      Object.keys(this.props.steemPosts.posts).length === 0 ||
      this.props.steemPosts.posts === undefined ||
      this.state.fetchingData
    ) {
      return void 0;
    }
    const post = this.props.steemPosts.posts[
      this.props.steemPosts.posts.length - 1
    ];
    const query = {
      tag: "photos",
      start_permlink: post.permlink,
      start_author: post.author
    };
    await this.setState({
      fetchingData: true
    });
    await this.props.getSteemTrendingPosts(query);
    await this.setState({
      fetchingData: false
    });
  }
  updateDimensions() {
    this.setState({
      innerWidth: window.innerWidth
    });
  }
  async componentWillMount() {
    window.addEventListener("resize", this.updateDimensions);
    await this.props.getSteemTrendingPosts("photos");

    await this.setState({
      items: store.getState(),
      posts: this.props.steemPosts.posts,
      fetchingData: false
    });
  }

  async handleVoting(username, author, permlink, votePercent) {
    if (votePercent === 0) {
      await steemVote(
        username,
        author,
        permlink,
        store.getState().votePower.power
      );

      this.updateVotingState(
        {
          permlink: author + "/" + permlink,
          percent: store.getState().votePower.power
        },
        true
      );
    } else if (votePercent > 0) {
      await steemVote(username, author, permlink, 0);

      this.updateVotingState(
        {
          permlink: author + "/" + permlink,
          percent: 0
        },
        false
      );
    }
  }

  checkVoteStatus(props) {
    const find = this.state.items.steemProfileVotes.votes.find(
      o => o.permlink === props
    );
    if (find) {
      return {
        status: true,
        percent: find.percent
      };
    } else {
      return {
        status: false,
        percent: 0
      };
    }
  }
  renderWaypoint() {
    return (
      <Waypoint scrollableAncestor={window} onEnter={this.loadMorePosts}>
        <span style={{ color: "transparent" }}>Loading...</span>
      </Waypoint>
    );
  }

  async updateVotingState(props, action) {
    if (action === true) {
      this.props.postVoteToState(props);
    } else if (action === false) {
      this.props.removeVoteFromState(props);
    }
  }
  renderPosts() {
    return this.props.steemPosts.posts.map(post => {
      let width = "%";

      let fullPermlink = [post.root_author, post.root_permlink].join("/");
      return (
        <Post
          post={post}
          username={this.state.items.steemProfile.profile._id}
          isFollowing={this.state.items.following.users.includes(post.author)}
          key={post.id}
          updateVotingState={this.updateVotingState}
          voteStatus={this.checkVoteStatus(fullPermlink)}
          fullPermlink={fullPermlink}
          handleVoting={this.handleVoting}
          width={width}
          componentLocation="explore"
        />
      );
    });
  }
  render() {
    const breakpointColumnsObj = {
      default: 3,
      1100: 3,
      768: 2,
      426: 1
    };

    return (
      <Container>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {this.renderPosts()}
        </Masonry>
        {this.state.fetchingData ? <Spinner /> : this.renderWaypoint()}
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  steemProfile: state.steemProfile,
  following: state.following,
  steemProfileVotes: state.steemProfileVotes,
  steemPosts: state.steemPosts,
  postFollowingToState: state.postFollowingToState
});

export default connect(mapStateToProps, {
  getUserFollowing,
  getProfileVotes,
  getSteemTrendingPosts,
  postFollowingToState,
  postVoteToState,
  removeVoteFromState
})(hot(module)(Trending));
