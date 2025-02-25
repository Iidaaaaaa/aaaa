class FishingGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");
    this.lurePosition = { x: window.innerWidth / 2, y: 100 };
    this.fishes = [];

    this.setupSocketIo();
    this.createFishes();
    this.startGameLoop();
  }

  setupSocketIo() {
    this.socket = io("http://172.24.81.53:3000"); // サーバーのIPアドレスとポートを指定

    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.socket.emit("register", { clientType: "pc" });
      document.getElementById("status").textContent = "接続完了！";
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      document.getElementById("status").textContent = "接続エラー";
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
      document.getElementById("status").textContent = "切断されました";
    });

    this.socket.on("movement", (data) => {
      this.updateLurePosition(data.x, data.y, data.z);
    });
  }

  createFishes() {
    for (let i = 0; i < 5; i++) {
      this.fishes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight - 200) + 200,
        speed: Math.random() * 2 + 1,
        direction: Math.random() < 0.5 ? -1 : 1,
      });
    }
  }

  updateLurePosition(x, y, z) {
    // スマホの傾きデータから釣り竿の位置を計算
    this.lurePosition.x += x * 10;
    this.lurePosition.y = Math.max(
      100,
      Math.min(window.innerHeight - 100, this.lurePosition.y + y * 5)
    );
  }

  startGameLoop() {
    const update = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // 魚の描画と移動
      this.fishes.forEach((fish) => {
        fish.x += fish.speed * fish.direction;
        if (fish.x < 0 || fish.x > window.innerWidth) {
          fish.direction *= -1;
        }

        this.ctx.fillStyle = "#000080";
        this.ctx.beginPath();
        this.ctx.arc(fish.x, fish.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // ルアーの描画
      this.ctx.fillStyle = "#FF0000";
      this.ctx.beginPath();
      this.ctx.arc(
        this.lurePosition.x,
        this.lurePosition.y,
        10,
        0,
        Math.PI * 2
      );
      this.ctx.fill();

      // 釣り糸の描画
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.beginPath();
      this.ctx.moveTo(this.lurePosition.x, 0);
      this.ctx.lineTo(this.lurePosition.x, this.lurePosition.y);
      this.ctx.stroke();

      requestAnimationFrame(update);
    };

    update();
  }
}

window.onload = () => {
  new FishingGame();
};
