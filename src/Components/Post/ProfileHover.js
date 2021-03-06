import React, { Component } from "react";
import styled from "styled-components";
import FollowBtn from "./FollowBtn";
import store from "../../store";
import { getAccounts } from "../../actions/getAccounts";
import { Link } from "react-router-dom";
const Container = styled.div`
  border-radius: 2px;
  background-color: white;
  position: absolute;
  width: 25vw;
  margin-top: -20px;
  top: 80px;
  z-index: 600;
  @media (max-width: 768px) {
    display: none;
    width: 40vw;
  }
`;
const Header = styled.div`
  background: url(${props => props.coverImage});
  box-sizing: border-box;
  position: relative;
  background-size: cover;
  background-color: #b4b4b4;
  height: 125px;

  b {
    cursor: auto;
  }
  a {
    color: white;
    padding-left: 5px;
  }
`;
const HeaderActions = styled.div`
  box-sizing: border-box;
  padding: 5px;
  padding-top: 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  color: #fff;
  background: linear-gradient(
    rgba(38, 50, 56, 0.5),
    rgba(38, 50, 56, 0.3),
    rgba(38, 50, 56, 0.02)
  );
  button {
    margin-right: 0;
    color: #fff;
  }
`;

const Avatar = styled.div`
  background: url(${props => props.url});
  background-size: cover;
  background-repeat: no-repeat;
  width: 80px;
  height: 80px;
  position: absolute;
  left: calc(50% - 40px);
  margin-bottom: -40px;
  bottom: 0;
`;
const Content = styled.div`
  box-sizing: border-box;
  margin-top: 50px;
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;

  b {
    cursor: inherit;
    font-size: 24px;
  }
  p {
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
    white-space: inherit;
    overflow: hidden;
  }
`;
const FeaturedPosts = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-bottom: 10px;
`;
const Post = styled.div`
  background-color: #e2e1e2;
  width: calc(18vw / 3);
  height: calc(18vw / 3);
`;
export default class ProfileHover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      account: undefined,
      author: this.props.author,
      jsonMetadata: ""
    };
    this.loadAccount(this.props.author);
  }
  async loadAccount(props) {
    await store.dispatch(getAccounts([props]));
    const search = store.getState().steemAccounts.accounts.filter(acc => {
      return acc.name === this.props.author;
    });
    const coverImage =
      search[0] === undefined ||
      search[0] === null ||
      search[0] === "" ||
      search[0].json_metadata === "" ||
      search[0].json_metadata === "{}" ||
      JSON.parse(search[0].json_metadata).profile.cover_image === undefined
        ? void 0
        : JSON.parse(search[0].json_metadata).profile.cover_image;
    await this.setState({
      account: search,
      coverImageUrl: coverImage
    });
  }
  render() {
    const jsonMetadata =
      this.state.account === undefined ||
      this.state.account[0].json_metadata === "" ||
      this.state.account[0].json_metadata === "{}"
        ? ""
        : JSON.parse(this.state.account[0].json_metadata);
    return (
      <Container
        onMouseOver={this.props.handleProfileDivHover}
        onMouseLeave={this.props.handleProfileHover}
      >
        <Header coverImage={this.state.coverImageUrl}>
          <HeaderActions>
            <Link to={"/@" + this.props.author}>{this.props.author}</Link>
            {this.props.isFollowing ? (
              void 0
            ) : (
              <FollowBtn onClick={this.props.handleFollowBtn}>Follow</FollowBtn>
            )}
          </HeaderActions>
          <Avatar
            url={`https://steemitimages.com/u/${this.props.author}/avatar`}
          />
        </Header>
        <Content>
          <b>{jsonMetadata === "" ? void 0 : jsonMetadata.profile.name}</b>
          <p>{jsonMetadata === "" ? void 0 : jsonMetadata.profile.about}</p>
          <FeaturedPosts>
            <Post />
            <Post />
            <Post />
          </FeaturedPosts>
        </Content>
      </Container>
    );
  }
}
