# Electronic-Commerce-Book-Shop-and-Customer-Churn-Prediction
This is the server for electronic commerce book shop website with customer churn prediction using artificial neural network powered by TensorFlow.js.

# User Guide
1. Open the folder using Visual Studio Code.
2. In the terminal, run "npm install" to install the node modules.
3. In the terminal, run "npm run dev" to start the server.
4. For administrator side, go to "http://localhost:5000/administrator/inventory.html". The user name is "Admin 1" and the password is "My$Password123". For customer side, go to "http://localhost:5000/customer/home.html". The user name is "chan" and the password is "My$Password123".

# Important side note about TensorFlow
1. To be able to npm install @tensorflow/tfjs-node, Visual Studio and its "Desktop development with C++" workload must be installed first.
2. If "ERR_DLOPEN_FAILED" error iis encountered, try move "\node_modules@tensorflow\tfjs-node\deps\lib\tensorflow.dll" to "\TFJS\node_modules@tensorflow\tfjs-node\lib\napi-v8\". (Reference: https://stackoverflow.com/questions/78192570/tfjs-node-giving-err-dlopen-failed)

# Training dataset and churn prediction model
1. The training dataset is stored in "ChurnTrainingDataset/ecom-user-churn-data.csv" file. The source of the dataset is https://www.kaggle.com/datasets/fridrichmrtn/user-churn-dataset.
2. The file "FYP_April_2024_Machine_Learning/Churn.ipynb" is the Jupyter Notebook file which the analysis of the training data is done. The file can be run in Visual Studio Code.
3. The churn prediction model is pre-trained and stored in the "ChurnModel" folder. There is one "model.json" file and one "weights.bin" file.
