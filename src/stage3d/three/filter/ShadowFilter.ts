///<reference path="./TexFilter.ts" />
module rf{

    export const enum FilterConst{
        SHADOW = "shadow_"
    }

    export class ShadowFilter extends TexFilter{



        target:SceneObject
        constructor(target:SceneObject){
            target.shadowTarget = true;
            super(target,FilterConst.SHADOW);
            
            this.v = newVector3D();

            var func = "";
            let def = "uniform mat4 sunmvp;\nvarying vec4 vShadowUV;\n";
            // var code = "vec4 shadowpos = sunmvp * p;\nshadowpos.xyz /= shadowpos.w;\nvShadowUV = shadowpos.xyz * 0.5 + 0.5;\n";
            var code = `vShadowUV = sunmvp * p;\n`;
            this.vertex = newShaderCode(code,def,func);

            this.readly = true;

            func = 
`
float unpackRGBAToDepth( const in vec4 v ) {
    return dot( v, UnpackFactors );
}
            
float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
    return step( unpackRGBAToDepth( texture2D( depths, uv ) ) , compare );
}
`;

            def = 
`
uniform sampler2D shadow;
varying vec4 vShadowUV;
const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
`;

            code = 
`
vec3 sc = vShadowUV.xyz / vShadowUV.w;
sc.xyz = sc.xyz * 0.5 + 0.5;
float shadowValue = texture2DCompare(shadow, sc.xy,sc.z+0.001);
color.xyz *= vec3(1.0 - shadowValue * 0.3);
// color = texture2D( shadow , vShadowUV.xy );
// color = vec4(vShadowUV.xyz,1.0);
`;
            this.fragment = newShaderCode(code,def,func);
        }

        v:IVector3D;

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            if(ROOT.shadow.rtt){
                ROOT.shadow.rtt.uploadContext(program, "shadow");
                context.setProgramConstantsFromMatrix("sunmvp",this.target.shadowMatrix);
            }
        }









    }
}