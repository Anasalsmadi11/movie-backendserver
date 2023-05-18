"use strict";
require("dotenv").config()
const express = require("express");
const cors = require("cors");
const  axios = require("axios");
const app = express();
const port = process.env.PORT;
const movieKey =process.env.API_KEY;
app.use(cors());
app.use(express.json());
const pg= require('pg');
const client= new pg.Client(process.env.DATABASE_URL);
// const movieData = require("./Movie Data/data.json");

function Movie(id,title,releaseDate,posterPath, overview) {
  this.id=id;
  this.title = title;
  this.releaseDate = releaseDate;
  this.posterPath=posterPath;
  this.overview = overview;
}

app.get("/favorite", favorite);
app.get("/trending",trendingHandle)
app.get("/search",searchHandle)
app.get("/collection",collectionHandle)
app.get("/people",peopleHandle)
app.get("/movies",getMoviesFromDb)
app.post("/movies",addMovieToDbTable)
app.put("/movies/:id", updateMovies)
app.delete("/movies/:id", deleteMovies)
app.get("/movies/:id", getMovies)

function getMovies(req,res){
  const getId=req.params.id;
  const sql =`select * from movielist where id=${getId}`
  client.query(sql).then((data)=>{
    res.status(202).send(data.rows)
  })
}

function deleteMovies(req,res){
  const id=req.params.id;
  const sql =`delete from Movielist where id=${id};`
  client.query(sql).then((data)=>{
    
    const newSql= `select * from movielist`
    client.query(newSql).then((data)=>{

      res.status(200).json(data.rows)
    })
  })
}

function updateMovies(req,res){
  const updateId = req.params.id
  console.log(updateId)
  const sql= `update Movielist set title=$1, releasedate=$2, posterpath=$3, overview=$4 where id=${updateId} returning *;`
  const values=[req.body.title, req.body.releasedate, req.body.posterpath, req.body.overview]

  client.query(sql, values).then((data)=>{

      const newSql= `select * from movielist`
      client.query(newSql).then((data)=>{
  
        res.status(200).json(data.rows)
      })
    })
  
}

function getMoviesFromDb(req,res){
  const sql='select * from movielist;';
  client.query(sql).then((data)=>{
    // res.send(data)

// i commented the mapping below because when it send the data it send it with names other than the table names for example: instead of sending releasedate it send releaseDate and the reson is the constructor

    // let movieData=data.rows.map((item)=>{
    //   let newMovie= new Movie(item.id,item.title,item.releasedate,item.posterpath,item.overview) //we get the names from the data in db(notice there is no camelcase)
    //   return newMovie
    // })
    res.send(data.rows)
  })
}

function addMovieToDbTable(req,res){
  const movie =req.body;
  // console.log(movie)
  let sql ='insert into movielist(title,releasedate,posterpath,overview) values($1,$2,$3,$4) returning *;'
  const values =[movie.title,movie.releasedate, movie.posterpath , movie.overview]
  client.query(sql,values).then((data)=>{
    res.status(201).send(data.rows)
  })

}


  async function trendingHandle(req,res){
  const url=`https://api.themoviedb.org/3/trending/all/week?api_key=${movieKey}&language=en-US`
  // const url1=`https://api.themoviedb.org/3/movie/550?api_key=${movieKey}`
  
  let trendingFromApi=await axios.get(url)
  // console.log(trendingFromApi)// to know what is inside the trendingFromApi i have to console it to see(result in map) if i need to type data or result should i type in map
  let trendingMovies=trendingFromApi.data.results.map((item)=>{
    return new Movie(item.id,item.title,item.release_date,item.poster_path,item.overview)

  })
  // console.log(trendingMovies)
  res.send(trendingMovies)
}

function searchHandle(req,res){
  let searchByMovie=req.query.search
  const url =`https://api.themoviedb.org/3/search/movie?api_key=${movieKey}&language=en-US&query=The&page=2&movie=${searchByMovie}`
  axios.get(url).then((result)=>{
    console.log(result.data)
    res.send(result.data) //(http://localhost:3000/search?search=NARUTO ,first[search is from the path in line24 the second one from req.query.search]) console the searchByMovie after you put the name(NARUTO) in the commented link and go to the terminal you'll find that searchByMovie have the value NARUTO
  })
}

function collectionHandle(req,res){
  let searchForCollections= req.query.collection
  const url = `https://api.themoviedb.org/3/search/collection?api_key=${movieKey}&language=en-US&page=1&collection${searchForCollections}`
  
  axios.get(url).then((result)=>{
    console.log(result.data)
    res.send(result.data)
  })
}

function peopleHandle(req,res){
  let searchForPeople=req.query.people;
  console.log(searchForPeople)
  const url =`https://api.themoviedb.org/3/search/person?api_key=${movieKey}&language=en-US&page=1&include_adult=false&people${searchForPeople}`
  axios.get(url).then((result)=>{
    res.send(result.data)
  })
}

 async function peopleHandle(req,res){
  let url = `https://api.themoviedb.org/3/person/934433?api_key=${movieKey}&language=en-US`
  // const url=`https://api.themoviedb.org/3/trending/all/week?api_key=${movieKey}&language=en-US`
  let peopleFromApi= await axios.get(url)
  let actors=peopleFromApi.data.results.map((item)=>{
    new Movie(item.id)
  })
  // console.log(peopleFromApi)
  console.log(actors)
  res.send(actors)
}

// res.json(`welcome to my first server`)
app.get("/", (req, res) => {
  return res.status(200).send("Hello World");
});

function favorite(req, res) {
  res.json(`Welcome to Favorite Page
    `);
}

app.use((req, res, next) => {
    res.status(404).send('Sorry, the requested resource was not found');
  });
app.use(notFoundHandle);
function notFoundHandle(req, res) {
  res.status(500).send({status:500,responseText:"the pageis not found"});
}
app.use(notFoundHandler);
function notFoundHandler(req, res) {
  res.status(404).send({status:404,responseText:"the pageis not found"});
}


client.connect().then(()=>{
  app.listen(port, () => {
    console.log(`this server listen on port ${port}`);
  });
})