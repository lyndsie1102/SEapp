This is a simple full-stack web application composed of a backend and a frontend. It utilizes Flask for the backend API and ReactJS for the frontend interface.

# Instructions to launch application on INB labs' PCs

## 1. Clone the repository

Open a Terminal, the launch the following commands:

```Bash
git clone https://github.com/francescodelduchetto/CMP9134-2425-basicWebApp
```

## 2. Open Visual Studio Code Container

1. Open VS Code
2. Click on the blue icon in the bottom left corner 
     <img width="59" alt="image" src="https://github.com/francescodelduchetto/RBT1001/assets/7307164/adc84af7-daa9-4470-a550-06e017a5cf2c">

3. Select "Open Folder in Container..."
4. Locate the folder `CMP9134-2425-basicWebApp`, select it and click Open
5. Wait until the setup is complete.


## 3. Install requirements
:exclamation: The following commands needs to be launched from terminals inside VSCode (click Terminal > New Terminal).

1. Install Python package requirements:
     ```Bash
     pip install -r requirements.txt
     ```
2. Install NodeJs and its requirements:
     ```Bash
     curl -sL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
     ```
     ```Bash
     sudo bash nodesource_setup.sh && sudo apt install -y nodejs
     ```
     ```Bash
     cd frontend
     ```
     ```Bash
     npm install
     ```

## 4. Launch backend
Open a new VSCode Terminal and launch the following commands.

```Bash
cd ../backend
```
```Bash
python main.py
```

## 5. Launch frontend
On a different terminal, launch:

```Bash
cd frontend
```
```Bash
npm run dev
```
This will start the development server for the frontend, usually accessible at http://localhost:5173/.


## CREDITS:
Adapted from: [https://github.com/Pakheria/Basic-Web-Application](https://github.com/Pakheria/Basic-Web-Application)

