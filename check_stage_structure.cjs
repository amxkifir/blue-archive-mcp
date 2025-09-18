const https = require("https");

async function fetchStageData() {
  return new Promise((resolve, reject) => {
    https.get("https://schaledb.com/data/cn/stages.json", (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const stages = JSON.parse(data);
          console.log("=== 关卡数据结构检查 ===");
          console.log("总关卡数:", stages.length);
          
          if (stages.length > 0) {
            console.log("\n=== 第一个关卡的完整数据 ===");
            console.log(JSON.stringify(stages[0], null, 2));
            
            console.log("\n=== 前5个关卡的关键字段 ===");
            stages.slice(0, 5).forEach((stage, index) => {
              console.log(`关卡 ${index + 1}:`);
              console.log(`  Id: ${stage.Id}`);
              console.log(`  Name: ${stage.Name}`);
              console.log(`  Category: ${stage.Category}`);
              console.log(`  Chapter: ${stage.Chapter}`);
              console.log(`  Terrain: ${stage.Terrain}`);
              console.log(`  Type: ${stage.Type}`);
              console.log("---");
            });
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

fetchStageData().catch(console.error);
