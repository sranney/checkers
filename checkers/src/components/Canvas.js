import React from "react";

function Piece(x,y){
    this.x = x;
    this.y = y;
    this.size = (Math.random() * 0.5 + 0.75) * 15;
    this.gravity = (Math.random() * 0.5 + 0.75) * .7;
    this.rotation = (Math.PI * 2) * Math.random();
    this.rotationSpeed = this.rotation * 0.005;
    this.color = randColor();
}
const randColor = ()=>{
    let colors = ["#f00","#0f0","#00f","#ff0","#f0f","#0ff"];
    return colors[Math.floor(Math.random()*colors.length)]
}
export default class Canvas extends React.Component{
    constructor(){
        super();
        this.pieces = [];
        this.numPieces = 25;
        this.lastUpdateTime = Date.now();
        this.dropConf = false;
        this.canvas;
        this.context;
        this.totalPieces=0;
        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
    }

    update = () =>{

        if(this.pieces.length>0){
            let now = Date.now();
            let deltaTime = now - this.lastUpdateTime;

            for ( let i = this.pieces.length - 1 ; i >= 0 ; i --) {
                let p = this.pieces[i];
                if(p.y > this.canvas.height){
                    this.pieces.splice(i,1);
                    continue;
                }
                p.y += p.gravity * deltaTime;
                p.rotation += p.rotationSpeed * deltaTime;
            }

            while(this.pieces.length<this.numPieces&&this.totalPieces<75){
                this.pieces.push(new Piece(Math.random() * this.canvas.width,-20));
                this.totalPieces++;
            }

            this.lastUpdateTime = now;			
            setTimeout(this.update,1);
           this.draw();
        } else {
            var canvasElmt = document.querySelector("canvas");
            document.querySelector("body").removeChild(canvasElmt);
            this.totalPieces = 0;
        }
    }

    draw = ()=>{
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.pieces.forEach(function(p){
            this.context.save();
            
            this.context.fillStyle = p.color;

            this.context.translate(p.x+p.size/2,p.y+p.size/2);
            this.context.rotate(p.rotation);

            this.context.fillRect(-p.size/2,-p.size/2,p.size,p.size)

            this.context.restore();
        })
        requestAnimationFrame(this.draw);

    }
}