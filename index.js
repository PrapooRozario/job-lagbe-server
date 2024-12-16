require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qgpkx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = client.db("JobLagbeDB").collection("Jobs");
    const applicationCollection = client
      .db("JobLagbeDB")
      .collection("Applications");

    app.get("/jobs", async (req, res) => {
      const jobs = await jobsCollection.find().toArray();
      res.send(jobs);
    });

    app.get("/jobs/application/:email", async (req, res) => {
      const email = req.params.email;
      const applications = await applicationCollection
        .find({
          applicant_email: email,
        })
        .toArray();

      for (const application of applications) {
        const job = await jobsCollection.findOne({
          _id: new ObjectId(application.job_id),
        });
        application.title = job.title;
        application.company = job.company;
        application.location = job.location;
      }

      res.send(applications);
    });

    app.get("/jobs/:id", async (req, res) => {
      const { id } = req.params;
      const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
      res.send(job);
    });

    app.post("/applications", async (req, res) => {
      const application = req.body;
      const result = await applicationCollection.insertOne(application);
      res.send(result);
    });

    app.get("/applications", async (req, res) => {
      const email = req.query.email;
      const result = await applicationCollection
        .find({ applicant_email: email })
        .toArray();
      res.send(result);
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Server is running...");
});
