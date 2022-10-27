width = 40;
depth = 40;
// Mold bottom thickness
thickness = 0.6;

// Size of the border around the basin
moldBorderSize = 2;

holderWallSize = 3;


// Height of the letters
letterHeight = 1;

// Height of the interface that is only silicone
siliconeHeight = 0.6;
// Height of the interface between silicone and the handle
interfaceHeight = 3;

// Height of the base
baseHeight = siliconeHeight + interfaceHeight;

// Stamp height
stampHeight = 50;
// Stamp radius
stampRadius = 10;

// Stamp holder bar center height. Relative to top of the mold
holderHeight = 40;
// Stamp holder bar radius
holderRadius = 1.6;

interfaceMargin = 1;
interfaceWidth = width - interfaceMargin*2;
interfaceDepth = depth - interfaceMargin*2;

moldWidth = width + 2*moldBorderSize;
moldDepth = depth + 2*moldBorderSize;
moldHeight = thickness + letterHeight + baseHeight;

tolerance = 0.1;

bottomPlateHeight = 1;

baseBevel = 2;
basePyramidHeight = min(max(interfaceDepth-baseBevel,interfaceWidth-baseBevel), stampHeight*0.3);

enableHoles = false;

$fa = $preview ? 12 : 6;
$fs = $preview ? 2 : 1;


echo($fa);
echo($fs);


module motif(height) {
    linear_extrude(height = height) {
        text("OK", size = 10, halign = "center", valign = "center");
    }
}

module toastMotif(height) {
    linear_extrude(height = height + 1) {
        scale(0.28)
         offset(0.01)
        import("/home/lennart/Documents/stamp/examples/qr.svg", center= true);
    }

    //     difference() {
    //     translate([0,0,height]) 
    //     surface("/home/lennart/Documents/stamp/toast.png", invert = true, center = true, convexity = 100);
    //     translate([-500,-500,-1000])
        
    //     cube([1000,1000,1000]);
    // }
}

module mold() {
    difference(){
        translate([tolerance, tolerance, 0]){
            cube([moldWidth - 2*tolerance, moldDepth- 2*tolerance, moldHeight]);
            // translate([0,0,moldHeight])
            // difference(){
            //     cube([sin(45)*moldBorderSize * 0.5, moldDepth- 2*tolerance, sin(45)*moldBorderSize  * 0.5]);
            //     rotate([0,-45,0])
            //     translate([0,-1,0])
            //     cube([moldBorderSize*2, moldDepth- 2*tolerance + 2, moldBorderSize*2]);
            // }
            
        }
        copy_mirror(vec=[1,0,0], point=[moldWidth/2, 0,0])
        translate([0,0,moldHeight *0.75 - tolerance])
        rotate([0,-45,0])
        cube([moldBorderSize*2, moldDepth, moldBorderSize*2]);

        copy_mirror(vec=[0,1,0], point=[0, moldDepth/2,0])
        translate([0,0,moldHeight *0.75 - tolerance])
        rotate([45,0,0])
        cube([moldWidth, moldBorderSize*2, moldBorderSize*2]);

        

        translate([moldBorderSize, moldBorderSize, thickness +letterHeight])
        cube([width, depth, baseHeight +1]);

        translate([moldWidth / 2, moldDepth / 2, thickness])
        render()
        children();
        
    }

}

module copy_mirror(vec=[1,0,0], point=[0,0,0])
{
    children();
    
    translate(point)
    mirror(vec)
    translate(-point)
    children();
}

module moldHold() {

    difference(){
        cube([moldWidth + 2*holderWallSize, moldDepth + 2*holderWallSize, bottomPlateHeight + moldHeight * 0.5]);
        translate([holderWallSize, -1 ,bottomPlateHeight])
        cube([moldWidth, moldDepth +1 + holderWallSize, moldHeight]);
    }

    holderHolderHeight = holderHeight + bottomPlateHeight + moldHeight;

    for(i = [0, moldWidth + holderWallSize])
    translate([i,holderWallSize + moldDepth/2,  0])
    difference(){
        translate([0,-holderWallSize-holderRadius])
        cube([holderWallSize, holderWallSize*2 + holderRadius*2, holderHolderHeight]);
        translate([-1,0, holderHolderHeight])
        rotate([0,90,0])
        cylinder(h = holderWallSize + 2, r = holderRadius, $fn = 20);
    }

    holderLength = holderWallSize;

    copy_mirror(point=[holderWallSize+ moldWidth/2,0,0]) 
    for(i = [holderWallSize + moldBorderSize, moldDepth - moldBorderSize])
    translate([0,i,  0])
    difference(){
        union(){
            cube([holderWallSize, holderWallSize, bottomPlateHeight + moldHeight * 0.75 + holderWallSize]);
            translate([0,0,bottomPlateHeight + moldHeight * 0.75])
            translate([+holderWallSize,0,0])
            rotate([0,45,0])
            translate([-holderWallSize,0,0])
            cube([holderWallSize, holderWallSize, moldHeight*0.25*2]);
        }
        translate([-1,-1,bottomPlateHeight + moldHeight])
        cube([holderLength*2 +2, holderLength*2 +2, holderWallSize *2 ]);
    }
}

// Centered handle.
// Should extend `interfaceDepth` below 0 z
module handle() {
    lowerHandleHeight = 30;

    point = 1 - (stampRadius / stampHeight);
    exponent = 1.3;
    lowerPoint = 0.7;
    translate([0,0,0])
    rotate_extrude() {
        polygon(points = [
            [0,stampHeight*point],
            for (a = [0:10]) [cos(a*90/10)*(stampRadius),stampHeight*point + sin(a*90/10)*(stampHeight*(1-point))] ,
            [0,stampHeight]
        ]);
        polygon(points = [
            [0,stampHeight * point],
            for (a = [0:0.1:1]) [cos(a*-90)*(stampRadius),pow((1-a),exponent)*(stampHeight*(point))] ,
            [0,0]
        ]);
    }

    
    minkowski(){
        $fn = 8;
        union(){
            pyramid([interfaceWidth-baseBevel, interfaceDepth-baseBevel, basePyramidHeight], center=true);
            translate(-[(interfaceWidth-baseBevel)/2, (interfaceDepth-baseBevel)/2, interfaceHeight])
            cube([(interfaceWidth-baseBevel), (interfaceDepth-baseBevel), interfaceHeight]);
        }
        difference(){
            sphere(d=baseBevel);
            translate([0,0,-baseBevel]) 
            cube([baseBevel*2,baseBevel*2,baseBevel*2], center=true);
        }
    }

}

module pyramid(size, center) {
    width = size[0];
    depth = size[1];
    height = size[2];

    translate(center ? -[width/2, depth/2, 0] : [0,0,0]) 
    // thx copilot
    polyhedron([
        [0,0,0],
        [width,0,0],
        [width,depth,0],
        [0,depth,0],
        [width/2,depth/2,height]
    ],[
        [0,1,2,3],
        [0,4,1],
        [1,4,2],
        [2,4,3],
        [3,4,0]
    ]);
}

module stamp() {
    holeMargin = 3;

    preferredHoleDistance = 8;

    holesWidth = interfaceWidth - 2* holeMargin;
    holesDepth = interfaceDepth - 2* holeMargin;



    holes = [round(holesWidth / preferredHoleDistance), round(holesDepth/preferredHoleDistance)];


    difference() {
        translate([interfaceWidth/2,interfaceDepth/2,interfaceHeight])
        handle();

        if(enableHoles)
        translate([holeMargin, holeMargin, 0])
        holes([holesWidth, holesDepth], holes);

        translate([0,interfaceDepth/2,interfaceHeight + holderHeight ])
        rotate([45,0,0])
        translate([0,-holderRadius,-holderRadius])
        cube([interfaceWidth, holderRadius*2, holderRadius*2]);
    }
}

module holes(size = [interfaceWidth, interfaceDepth], rows = [3,3]) {
    width = size[0];
    depth = size[1];

    angle = 50;

    holeDiameter = 1;
    holeLength = sin(angle)*interfaceHeight + sin(angle) * holeDiameter/2;
    airHoleLength = stampHeight*2;
    airHoleDiameter = 1;



            for(x = [0:width/max(rows[0]-1,1):width])
            for(y = [0:depth/max(rows[1]-1,1):depth])
            translate([x,y,0]){
                $fn=8;
                randomAngle = rands(0,360,1)[0];
                xDif = (width/2 - x) - 0.0001;
                yDif = (depth/2 - y);

                outwardAngle = sign(yDif-0.001) * acos(xDif / sqrt(pow(xDif, 2) + pow(yDif, 2)));

                offsetX = cos(randomAngle)*holeLength;
                offsetY = sin(randomAngle)*holeLength;

                xDif2 = (width/2 - x - offsetX/2) - 0.0001;
                yDif2 = (depth/2 - y - offsetY/2);

                outwardAngle2 = sign(yDif2-0.001) * acos(xDif2 / sqrt(pow(xDif2, 2) + pow(yDif2, 2)));

                fixAngle = outwardAngle2 - randomAngle;

                rotate([0,0,randomAngle])
                // rotate([0,0,fixAngle])
                {
                rotate([0,angle,0]){
                    
                  translate([0,0,-(holeDiameter * sin(angle))])
                  cylinder(h=(holeLength + (holeDiameter * sin(angle))), r=holeDiameter/2);
                  translate([0,0,holeLength])
                  sphere(d=holeDiameter);
                }

                translate([sin(angle)*holeLength,0,cos(angle)*holeLength])
                    
                rotate([0,0,fixAngle])
                rotate([0,-angle,0]){
                sphere(d=holeDiameter);
                cylinder(h=airHoleLength, r=airHoleDiameter/2);
                }
                }
            }
            
        
    
}


//toastMotif(letterHeight +1);
mold(){
    toastMotif(letterHeight +1);
}
// translate([-holderWallSize,-holderWallSize,-bottomPlateHeight])
// moldHold();
// //handle();
// translate([moldBorderSize + interfaceMargin, moldBorderSize + interfaceMargin, moldHeight - interfaceHeight])
//stamp();

//holes();
// moldHold();


