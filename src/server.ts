
import app from './app';

const PORT = Number(process.env.PORT) || 5000;

console.log(`HOUSTON!!! are we ok...!!!,are ready to gooo........!!!`);


// app.listen(5000, () => console.log("Server running..."));


app.listen(PORT, '0.0.0.0', () => {
  
  console.log(`HOUSTON!! the App running on port ${PORT}... Yikes....!!`);
});

