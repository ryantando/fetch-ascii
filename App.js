import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView, ActivityIndicator, Image, Picker} from 'react-native';
import { ListItem } from 'react-native-elements'


const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;
};
export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
        data: [],
        extraData: [],
        page: 1,
        loading: false,
        ended: false,
        usedImages: [],
        requestedFor: [],
        sortBy: ''
    }
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentWillMount(){
      this.totalRecords();
      this.getProducts(this.state.page, 40)
  }


  totalRecords(){
     return fetch('http://192.168.171.2:3000/products')
            .then((resp) => resp.json()) 
            .then((data) => {
              this.setState({total: data.length});
          }).catch(function(error) {
          console.log('There is a problem with fetch: ', error.message);
          this.setState({loading: false});
      });
  }

  handleScroll() {
      const {page, loading, data, total} = this.state;
          if(data.length < total){
              !loading && this.getProducts(page + 1, data.length + 20 > total ? total - data.length : 20);
          }
          else{
              this.setState({ended: true})
          }
          console.log("TOTAL : " + total)
      
  }

  formatDate(date) {
      var date1 = new Date(date);
      var date2 = new Date();
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return diffDays < 1 ? date : diffDays + " days ago";
  }

  getProducts(page, limit){
      const {data, extraData, sortBy} = this.state;
      if(extraData.length){
          this.setState({data: this.state.data.concat(extraData)})
      }
      this.setState({page, limit, loading: true});
      var url = 'http://192.168.171.2:3000/products?_page=' + page + '&_limit=' + limit;
      sortBy && (url += '&_sort=' + sortBy);
      fetch(url).then((resp) => resp.json())
          .then((newData) => {
              if(!data.length){
                  let extraData = newData.slice(20);
                  newData.length = 20;
                  this.setState({data: newData, extraData, loading: false});
              } else {
                  this.setState({extraData: newData, loading: false});
              }
          }).catch((error) => {
          console.log('There is a problem with fetch: ', error.message);
          this.setState({loading: false});
      });
  }

  getImage(index){
      var {usedImages, requestedFor} = this.state;
      let isUsed = usedImages.filter(e => e.index === index).length;
      if (!isUsed && !requestedFor.includes(index)) {
          fetch('http://192.168.171.2:3000/ads/?r=' + Math.floor(Math.random()*1000)).then((resp) => {
              let image = resp.url,
                  isImageUsed = usedImages.filter(e => e.image === image).length;
              console.log(image)
              usedImages.push({index, image: isImageUsed ? this.generateNewUrl(image) : image});
              this.setState(usedImages);
          }).catch((error) => {
              console.log('There is a problem with fetch: ', error.message);
          })
      }

  }

  generateNewUrl(image){
      const {ended} = this.state;
      let randomNumber = Math.floor(Math.random() * 25);
      var imageArray = image.split("=");
      imageArray[1] = randomNumber;
      image = imageArray.join("=");
      let isUsed = this.state.usedImages.filter(e => e.image === image).length;
      return isUsed && !ended ? this.generateNewUrl(image) : image;
  }

  sort(value){
      this.setState({sortBy: value, data: [], extraData: [], page: 1, ended: false, loading: true});
      var url = 'http://192.168.171.2:3000/products?_page=' + 1 + '&_limit=' + 40 + '&_sort=' + value;
      fetch(url).then((resp) => resp.json()) // Transform the data into json
          .then((newData) => {
              let extraData = newData.slice(20);
              newData.length = 20;
              this.setState({data: newData, extraData, loading: false});
          }).catch(function(error) {
          console.log('There is a problem with fetch: ', error.message);
          this.setState({loading: false});
      });
  }

  renderRows(product, index){
      var {usedImages} = this.state;
              this.getImage(index);
              var obj = usedImages.filter((e) => e.index === index);
              if(obj.length) {
                return (
                  <ListItem key={index + '_b' + obj}
                        title={<Text>But first, a word from our sponsors:</Text>}
                         subtitle={  
                        <View style={styles.randomImage}>
                              <Image
                                style={{width: 200, height: 200}}
                                source={{uri: obj[0].image}}
                                />
                        </View>
                         }
                         hideChevron={true}
                  />
                  );
              }
              else {  
                return (
                  <ListItem key={index + '_b' + obj}
                         subtitle={
                          <ActivityIndicator />
                         }
                         hideChevron={true}
                  />
                  );
              }
        
  }


  render() {
    const {data, loading, ended} = this.state;
    let people = this.state.data.map((val, key) => {
    
    if(key && !(key % 20)) {
        return this.renderRows(val, key)
    }
    else {
        if(val){
            console.log(val)
            return ( 
            <ListItem key={key}
            title={
                <Text style={{fontSize:15, paddingBottom:5, backgroundColor: '#d6d8d8'}}>{val.id}</Text>
            }
            subtitle={
                <View key={key} style={styles.card}>
                    <View style={{ flex: 1,flexDirection:'row'}}>
                        <Text style={{width: 100, height: val.size,fontSize: val.size}}>{val.face}</Text>
                        <View style={{ flex: 1,flexDirection:'column'}}>
                                <Text style={{width: 100, height: 20}}>Size: {val.size}</Text>
                                <Text style={{width: 100, height: 20}}>Price: ${val.price/100}</Text>
                        </View>
                    
                    </View>
                    <Text>{this.formatDate(val.date)}</Text>
                </View>
            }
            hideChevron={true}
            />
            );
        }
        else{
            return (<Text style={{fontSize: 20, textAlign: 'center', alignItems: "center"}}>~ End of Catalogue ~</Text>)
        }
      }
      });
        if(ended){
            loadingEnd = (<Text style={{fontSize: 20, textAlign: 'center', alignItems: "center"}}>~ End of Catalogue ~</Text>)
        }else{
            loadingEnd = (<ActivityIndicator />)
        }
        
      return (
          <View style={styles.container}>
            <Text style={{ padding:2}}>Sort by </Text>
            <View style={{ borderRadius:5, borderWidth:2, borderColor: 'black', color:'#747474'}}>
                <Picker selectedValue = {this.state.sortBy} onValueChange = {(itemValue, itemIndex) => this.sort(itemValue)}>
                <Picker.Item label = "None" value = "" />
                <Picker.Item label = "Id" value = "id" />
                <Picker.Item label = "Price" value = "price" />
                <Picker.Item label = "Size" value = "size" />
                </Picker>
            </View>
              <ScrollView 
                    style={styles.container}
                    onScroll={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                      this.handleScroll();
                      } }}
                      scrollEventThrottle={400}>
                    {people}
                    {loadingEnd}
              </ScrollView>
          </View>
      );
  
  }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#F5FCFF',
    },
    scroll:{
        flex:1,
        backgroundColor: '#fff'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    loadingStyle: {
        flex:1,
    },
    LoadingContainer: {
        paddingVertical: 30,
        backgroundColor: '#F5FCFF',
    },
    card: {
        flexDirection:'row',
        justifyContent:'center',
        backgroundColor: '#fff'
    },

    randomImage: {
        borderColor: 'black',
        borderWidth: 2,
        margin: 10,
        flexDirection:'row', 
        justifyContent:'center'
    }
});
