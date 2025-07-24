import app from './app';

const PORT = (process.env.PORT) || 5000;


console.log(`HOUSTON!!! are we ok...!!!,are ready to gooo........!!!`);

app.listen(PORT, () => {
  console.log(`HOUSTON!! the App running on port ${PORT}... Yikes....!!`);
});

