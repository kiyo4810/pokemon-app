export const getAllPokemon = (url) => {
  // 約束をする。fetch(url).then....then...の一行が完了するまで待つ
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => resolve(data));
  });
};

export const getPokemon = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);

        resolve(data);
      });
  });
};
