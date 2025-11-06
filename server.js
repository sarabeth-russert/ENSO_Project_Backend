"use strict";

import dotenv from "dotenv";
import express, { json } from "express";
import cors from "cors";
import axios from "axios";

dotenv.config();

const url =
  "https://www.pmel.noaa.gov/cgi-tao/cover.cgi?p32=8n165e&P18=180&P19=265&P20=-8&P21=9&P1=deliv&P2=sst&P3=dy&P4=2015&P5=12&P6=21&P7=2016&P8=4&P9=30&P10=buoy&P11=ascii&P12=None&P13=tt&P14=anonymous&P16=anonymous&P15=&P17=&p22=html&script=disdel%2Fnojava.csh";

const app = express();

app.use(json());

app.get("/test", (req, res) => res.send("test worked"));
app.get("/buoyDataRequest", handleBuoyDataRequest);
const filesToImport = [];
function handleBuoyDataRequest(req, res) {
  // const {} = req.query;
  axios
    .get(url)
    .then((results) => {
      const asciiFiles = results.data
        .split("<A href=")
        .filter((s) => s.includes(".ascii"));

      asciiFiles.forEach((f) => {
        filesToImport.push(f.match(/\/cache-tao\/[^\s"]+\.ascii/)[0]);
      });

      console.log("download url", filesToImport);

      res.status(200).send();
    })
    .then(() =>
      axios.get(`https://www.pmel.noaa.gov${filesToImport[0]}`).then((file) => {
        console.log(file);
      })
    )
    .catch((error) => {
      console.error(error.message);
      res.status(500).send("server error");
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on ${PORT}`));
