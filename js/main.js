/* text credit:
   山海經：中國哲學書電子化計劃 https://ctext.org
   博物誌：中華古詩文古書籍網 https://www.arteducation.com.tw
   those are ancient chinese books (山海經 is more than 2000 years 
   old and 博物誌 is abot 1500 years old) that decribe strange 
   things, myths, and super-nature spirits.
*/
let text_s, text_b;
let rm_s, rm_b;
let result;
let characters = [];
//let font,font2;
let filp = false;
let loc = [];
let num;
let ppmouseX = 0;
let timer = 0;
let img = [];
let current_img;
let started = false;
let start_img;
let sound;
let last5pages = [];
let current_loc_in_5pages = 10000;
let typeset_mode = 3;
let last5imgs = [];
let start_count = false;
let bird = ["鳥","鷹","鸚"];
let fish = ["魚","鮫","鱉"];

function preload() {
  text_s = loadStrings("./source/S.txt");
  text_b = loadStrings("./source/B.txt");
  //font credit: 康熙字典體 by TypeLand
  font = loadFont("./source/TypeLand-subset.otf");
  /*image from a old 山海經 book, there is over 100 strange animals
  describe in this book here is 40 something that I like
  */
  for (let i = 1; i < 46; i++) {
    let tem = "./img/" + str(i) + ".png";
    img.push(loadImage(tem));
  }
  start_img = loadImage('./source/start.png');
  //sound from sophiehall3535 at freesound.org
  sound = loadSound('./source/filp.mp3');
}

function setup() {
  let w, h;
  let r = 16 / 9;
  if (windowWidth / windowHeight >= r) {
    h = windowHeight;
    w = r * h;
  } else {
    w = windowWidth;
    h = w / r;
  }
  createCanvas(w, h);
  background(255);
  push();
  textAlign(CENTER, CENTER);
  textSize(width / 40);
  textFont("Noto Serif TC");
  text("Loading the Markov model...", width / 2, height / 2);
  pop();
  num = 350;
  rm = new RiMarkov(3);
  let ts = [];
  let tb = [];
  for (let i = 0; i < text_s.length; i++) {
    for (let j = 0; j < text_s[i].length; j++) {
      if (text_s[i][j] != "") {
        ts.push(text_s[i][j]);
      }
    }
  }
  for (let i = 0; i < text_b.length; i++) {
    for (let j = 0; j < text_b[i].length; j++) {
      if (text_s[i][j] != "") {
        tb.push(text_s[i][j]);
      }
    }
  }
  rm.loadTokens(ts);
  rm.loadTokens(tb, 2.5);
  //console.log(rm);
  // result = rm.generateTokens(num);
  // for (let i = 0; i < result.length; i++) {
  //   if (result[i] != 'c') {
  //     characters.push(result[i]);
  //   }
  // }
  current_img = img[0];
  // getloc();
  //google web font
  //textFont('Noto Serif TC');
  textFont(font);
  textAlign(CENTER, CENTER);
}

function draw() {
  background(255);
  if (!started) {
    let r = width / height;
    let w, h;
    let rr = 16 / 9
    if (r >= 16 / 9) {
      h = height;
      w = rr * h;
    } else {
      w = width;
      h = w / rr;
    }
    push();
    imageMode(CENTER);
    image(start_img, width / 2, height / 2, w, h);
    pop();
  } else {
    textSize(width / 40);
    for (let i = 0; i < characters.length; i++) {
      if (loc[i][0] > width / 40) {
        text(characters[i], loc[i][0], loc[i][1]);
      }
    }
    pic_display();
    drawline();
  }
  //console.log(last5pages);
  noLoop();
}

function mousePressed() {
  if (window.screen.availWidth >= 1280) {
    ppmouseX = mouseX;
    sound.play();
  }
}

function touchStarted() {
  if (window.screen.availWidth < 1280) {
    ppmouseX = mouseX;
    sound.play();

  }
}

function mouseReleased() {
  if (!started) {
    started = true;
  }
  if (ppmouseX - mouseX > max(50, width / 10) && window.screen.availWidth >= 1280) {
    filp = true;
    next_page();
    if (current_loc_in_5pages == 10000 || current_loc_in_5pages == last5pages.length - 1) {
      let range = [];
      for (let i = 0; i < last5pages[last5pages.length - 1].text.length; i++) {
        if (last5pages[last5pages.length - 1].text[i] =="鳥") {
          range = [11, 17, 24, 25, 26, 31, 32, 38, 41];
          break;
        } else if (last5pages[last5pages.length - 1].text[i] == "魚") {
          range = [6, 13, 14, 16, 22, 28, 39, 44];
          break;
        } else if (i > 200) {
          range = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 15, 18, 19, 20, 21, 23, 27, 29, 30, 33, 34, 35, 36, 37, 40, 42, 43, 44, 46];
          break;
        }
      }
      let index = random(range) - 1;
      if (last5imgs.length == 0) {
        last5imgs.push(index);
      } else {
        while (last5imgs.includes(index)) {
          index = random(range) - 1;
        }
        last5imgs.push(index);
      }
      if (last5imgs.length > 5) {
        last5imgs.shift();
      }
      //console.log(index);
      last5pages[last5pages.length - 1].imgindex = index;
      current_img = img[last5pages[current_loc_in_5pages].imgindex];
    } else {
      current_img = img[last5pages[current_loc_in_5pages].imgindex];
    }
    loop();
  } else if (mouseX - ppmouseX > max(50, width / 10) && window.screen.availWidth >= 1280) {
    filp = true;
    if (current_loc_in_5pages > 0) {
      last_page();
      current_img = img[last5pages[current_loc_in_5pages].imgindex];
    }
    loop();
  } else {
    sound.stop();
  }
}

function touchEnded() {
  if (!started) {
    started = true;
  }
  if (ppmouseX - mouseX > max(50, width / 10) && window.screen.availWidth < 1280) {
    filp = true;
    next_page();
    if (current_loc_in_5pages == 10000 || current_loc_in_5pages == last5pages.length - 1) {
      let range = [];
      for (let i = 0; i < last5pages[last5pages.length - 1].text.length; i++) {
        if (last5pages[last5pages.length - 1].text[i] == "鳥") {
          range = [11, 17, 24, 25, 26, 31, 32, 38, 41];
          break;
        } else if (last5pages[last5pages.length - 1].text[i] == "魚") {
          range = [6, 13, 14, 16, 22, 28, 39, 44];
          break;
        } else if (i > 200) {
          range = [1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 15, 18, 19, 20, 21, 23, 27, 29, 30, 33, 34, 35, 36, 37, 40, 42, 43, 44, 46];
          break;
        }
      }
      let index = random(range) - 1;
      if (last5imgs.length == 0) {
        last5imgs.push(index);
      } else {
        while (last5imgs.includes(index)) {
          index = random(range) - 1;
        }
        last5imgs.push(index);
      }
      if (last5imgs.length > 5) {
        last5imgs.shift();
      }
      last5pages[last5pages.length - 1].imgindex = index;
      current_img = img[last5pages[current_loc_in_5pages].imgindex];
    } else {
      current_img = img[last5pages[current_loc_in_5pages].imgindex];
    }
    loop();
  } else if (mouseX - ppmouseX > max(50, width / 10) && window.screen.availWidth < 1280) {
    filp = true;
    if (current_loc_in_5pages > 0) {
      last_page();
      current_img = img[last5pages[current_loc_in_5pages].imgindex];
    }
    loop();
  } else {
    sound.stop();
  }
}

function next_page() {
  if (current_loc_in_5pages == 10000 || current_loc_in_5pages == last5pages.length - 1) {
    result = rm.generateTokens(num);
    characters = [];
    r_string = RiTa.untokenize(result);
    start_count = false;
    for (let i = 0; i < r_string.length; i++) {
      if (r_string[i] == "c" && !start_count) {
        start_count = true;
      }
      let re = /[一-龥]/;
      //this might be stupid, but I can't come up with a better solution 
      //it take me lots of time looking at the uft-8 table to find out the last chinese character xd
      if (re.test(r_string[i]) && start_count) {
        characters.push(r_string[i]);
      }
    }
    typeset_mode = random([0, 1, 2, 3]);
    //console.log(RiTa.untokenize(characters));
    last5pages.push({
      text: RiTa.untokenize(characters),
      mode: typeset_mode
    });
    if (last5pages.length > 5) {
      last5pages_shift();
    }
    current_loc_in_5pages = last5pages.length - 1;
    getloc();
  } else {
    current_loc_in_5pages++;
    characters = [];
    for (let i = 0; i < last5pages[current_loc_in_5pages].text.length; i++) {
      if (last5pages[current_loc_in_5pages].text[i] != " ") {
        characters.push(last5pages[current_loc_in_5pages].text[i]);
      }
    }
    typeset_mode = last5pages[current_loc_in_5pages].mode;
    getloc();
  }
  filp = false;
}

function last5pages_shift() {
  last5pages.shift();
}

function last_page() {
  if (current_loc_in_5pages > 0) {
    current_loc_in_5pages--;
  }
  characters = [];
  for (let i = 0; i < last5pages[current_loc_in_5pages].text.length; i++) {
    if (last5pages[current_loc_in_5pages].text[i] != " ") {
      characters.push(last5pages[current_loc_in_5pages].text[i]);
    }
  }
  typeset_mode = last5pages[current_loc_in_5pages].mode;
  getloc();
  filp = false;
}

function getloc() {
  let l = characters.length
  let perline = floor((height - 60) / (width / 40 + 2));
  loc = [];
  for (let i = 0; i < l; i++) {
    let x;
    let lineno;
    let y;
    if (typeset_mode == 0) {
      lineno = ceil((i + 1) / perline);
      //LB
      if (lineno < 11) {
        y = 30 + (width / 80 + (width / 40 + 2) * (i % perline));
        x = width - width / 40 - (width / 40 + (floor(i / perline) * (width / 20)));
      } else {
        let i2 = i - 10 * perline;
        y = 30 + (width / 80 + (width / 40 + 2) * (i2 % floor((perline / 2))));
        x = width - width / 40 - (width / 40 + 10 * (width / 20) + (floor(i2 / floor((perline / 2))) * (width / 20)));
      }
    } else if (typeset_mode == 1) {
      lineno = ceil((i + 1) / perline);
      //.LT
      if (lineno < 11) {
        y = 30 + (width / 80 + (width / 40 + 2) * (i % perline));
        x = width - width / 40 - (width / 40 + (floor(i / perline) * (width / 20)));
      } else {
        let i2 = i - 10 * perline;
        y = 30 + (width / 80 + (width / 40 + 2) * (ceil(perline / 2) + i2 % floor(perline / 2)));
        x = width - width / 40 - (width / 40 + width / 20 * (10 + floor(i2 / floor(perline / 2))));
      }
    } else if (typeset_mode == 2) {
      //RB
      lineno = ceil((i + 1) / floor(perline / 2));
      if (lineno < 10) {
        y = 30 + (width / 80 + (width / 40 + 2) * (i % floor(perline / 2)));
        x = width - width / 40 - (width / 40 + (floor(i / floor(perline / 2)) * (width / 20)));
      } else {
        let i2 = i - 9 * floor(perline / 2);
        y = 30 + (width / 80 + (width / 40 + 2) * (i2 % perline));
        x = width - width / 40 - (width / 40 + 9 * (width / 20) + (floor(i2 / perline) * (width / 20)));
      }
    } else if (typeset_mode == 3) {
      //RT
      lineno = ceil((i + 1) / floor(perline / 2));
      if (lineno < 10) {
        y = 30 + (width / 80 + (width / 40 + 2) * (ceil(perline / 2) + i % floor(perline / 2)));
        x = width - width / 40 - (width / 40 + (floor(i / floor(perline / 2)) * (width / 20)));
      } else {
        let i2 = i - 9 * floor(perline / 2);
        y = 30 + (width / 80 + (width / 40 + 2) * (i2 % perline));
        x = width - width / 40 - (width / 40 + 9 * (width / 20) + (floor(i2 / perline) * (width / 20)));
      }
    }
    loc.push([x, y]);
  }
}

function pic_display() {
  let w;
  let h;
  let ratio = float(current_img.width / current_img.height);
  imageMode(CENTER);
  let img_x, img_y, x1, x2, y1, y2;
  if (typeset_mode == 0) {
    h = 148 * height / 360;
    w = ratio * h;
    img_x = width / 4;
    img_y = 194 * height / 360 + 74 * height / 360;
    x1 = width / 40;
    x2 = width * 2 / 4 - width / 40;
    y1 = 194 * height / 360;
    y2 = 342 * height / 360;
  } else if (typeset_mode == 1) {
    h = 170 * height / 360 - 28;
    w = ratio * h;
    img_x = width / 4;
    img_y = 14 + 85 * height / 360;
    x1 = width / 40;
    x2 = width / 2 - width / 40;
    y1 = 28;
    y2 = 170 * height / 360;
  } else if (typeset_mode == 2) {
    h = 148 * height / 360;
    w = ratio * h;
    img_x = width * 3 / 4;
    img_y = 194 * height / 360 + 74 * height / 360;
    x1 = width / 2 + width / 40;
    x2 = width - width / 40;
    y1 = 194 * height / 360;
    y2 = 342 * height / 360;
  } else if (typeset_mode == 3) {
    h = 170 * height / 360 - 28;
    w = ratio * h;
    img_x = width * 3 / 4;
    img_y = 14 + 85 * height / 360;
    x1 = width / 2 + width / 40;
    x2 = width - width / 40;
    y1 = 28;
    y2 = 170 * height / 360;
  }
  image(current_img, img_x, img_y, w, h);
  noiseSeed(random(1000));
  let noisep = 0;
  let weight = 3;
  if (width < 400) {
    weight = 2;
  }
  for (let y = y1; y < y2; y++) {
    push();
    noFill();
    stroke(0);
    strokeWeight(map(noise(noisep), 0, 1, 0, weight));
    point(x1, y);
    strokeWeight(map(noise(noisep + 40), 0, 1, 0, weight));
    point(x2, y);
    pop();
    noisep += 0.05;
  }
  let noisep2 = 0;
  for (let x = x1; x < x2; x++) {
    push();
    noFill();
    stroke(0);
    strokeWeight(map(noise(noisep2), 0, 1, 0, weight));
    point(x, y1);
    strokeWeight(map(noise(noisep2 + 40), 0, 1, 0, weight));
    point(x, y2);
    pop();
    noisep2 += 0.05;
  }
}

function drawline() {
  let weight = 3;
  if (width < 400) {
    weight = 2;
  }
  let h_weight = 6;
  if (width < 400) {
    h_weight = 4;
  }
  for (let x = width / 20 - width / 40; x < width - 8; x += width / 20) {
    noiseSeed(random(1000));
    let noisep = 0;
    if (typeset_mode == 0) {
      if (x <= width / 2) {
        for (let y = 28; y < 194 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      } else {
        for (let y = 28; y < 342 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      }
    } else if (typeset_mode == 1) {
      if (x <= width / 2) {
        for (let y = 170 * height / 360; y < 342 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      } else {
        for (let y = 28; y < 342 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      }
    } else if (typeset_mode == 2) {
      if (x <= width / 2) {
        for (let y = 28; y < 342 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      } else {
        for (let y = 28; y < 194 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      }
    } else if (typeset_mode == 3) {
      if (x <= width / 2) {
        for (let y = 28; y < 342 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      } else {
        for (let y = 170 * height / 360; y < 342 * height / 360; y++) {
          push();
          stroke(0);
          strokeWeight(map(noise(noisep), 0, 1, 0, weight));
          point(x, y);
          pop();
          noisep += 0.05;
        }
      }
    }
  }
  let noisep2 = 0;
  for (let x = 12; x < width - 12; x++) {
    push();
    stroke(0);
    strokeWeight(map(noise(noisep2), 0, 1, 0, weight));
    point(x, 28);
    strokeWeight(map(noise(noisep2 + 100), 0, 1, 0, weight));
    point(x, 342 * height / 360);
    pop();
    noisep2 += 0.05;
  }
  let noisep3 = 0;
  for (let y = 28; y < 342 * height / 360; y++) {
    push();
    stroke(0);
    strokeWeight(map(noise(noisep3), 0, 1, 0, weight));
    point(12, y);
    strokeWeight(map(noise(noisep3 + 100), 0, 1, 0, weight));
    point(width / 40, y);
    strokeWeight(map(noise(noisep3 + 200), 0, 1, 0, weight));
    point(width - 12, y);
    pop();
    noisep3 += 0.05;
  }
  let noisep4 = 0;
  for (let x = 6; x < width - 6; x++) {
    push();
    stroke(0);
    strokeWeight(map(noise(noisep4), 0, 1, 0.5 * h_weight, h_weight));
    point(x, 28 - 2 - h_weight);
    strokeWeight(map(noise(noisep4 + 100), 0, 1, 0.5 * h_weight, h_weight));
    point(x, 342 * height / 360 + 2 + h_weight);
    pop();
    noisep4 += 0.05;
  }
  let noisep5 = 0;
  for (let y = 28 - 2 - h_weight; y < 342 * height / 360 + 2 + h_weight; y++) {
    push();
    stroke(0);
    strokeWeight(map(noise(noisep5), 0, 1, 0.5 * h_weight, h_weight));
    point(6, y);
    strokeWeight(map(noise(noisep5 + 100), 0, 1, 0.5 * h_weight, h_weight));
    point(width - 6, y);
    pop();
    noisep5 += 0.05;
  }
}

function windowResized() {
  let w, h;
  let r = 16 / 9;
  if (windowWidth / windowHeight >= r) {
    h = windowHeight;
    w = r * h;
  } else {
    w = windowWidth;
    h = w / r;
  }
  resizeCanvas(w, h);
  getloc();
  loop();
}