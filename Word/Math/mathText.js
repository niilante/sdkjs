//change FontSize
// api 2003: asc_docs_api.prototype.put_TextPrFontSize
//Document: Paragraph_Add

//api 2215: asc_docs_api.prototype.sync_TextPrFontSizeCallBack
// возвращает размер шрифта

//api 2212: asc_docs_api.prototype.sync_TextPrFontFamilyCallBack
// возвращает название шрифта

//var DIV_CENT = 0.2487852283770651;

// /var DIV_CENT = 0.1;
var DIV_CENT = 0.1386;

function CMathTextPrp()
{
    this.FontFamily = undefined;
    this.FontSize   = undefined;
    this.Bold       = undefined;
    this.Italic     = undefined;
    this.RFonts     = {};
    this.Lang       = {};
}
CMathTextPrp.prototype =
{
    Merge: function(prp)
    {
        if(prp.FontFamily !== undefined)
            this.FontFamily = Common_CopyObj(prp.FontFamily);

        if(prp.FontSize !== undefined)
            this.FontSize = prp.FontSize;

        if(prp.Bold !== undefined)
            this.Bold = prp.Bold;

        if(prp.Italic !== undefined)
            this.Italic = prp.Italic;

    },
    Set: function(prp)
    {
        this.FontFamily = Common_CopyObj(prp.FontFamily);
        this.FontSize = prp.FontSize;
        this.Bold = prp.Bold;
        this.Italic = prp.Italic;
    }
}

function CMathText()
{
    this.typeObj = MATH_TEXT;
    this.pos = null;
    this.size = null;
    this.value = null;

    this.bJDraw = false;
    this.type  = TXT_ROMAN;

    this.GapLeft = 0;
    this.GapRight = 0;
    this.WidthVisible = 0;

    //this.Parent = null;

    /*this.TxtPrp = new CMathTextPrp();
    this.OwnTPrp = new CMathTextPrp();*/

    //this.sizeSymbol = null; // размер символа без учета трансформации


    // TO DO
    // убрать

    this.transform =
    {
        sx:  1,
        shy: 0,
        shx: 0,
        sy:  1
    };

}
CMathText.prototype =
{
    add: function(code)
    {
        if(code == 0x2A)      // "*"
            code = 0x2217;
        else if(code == 0x2D) // "-"
            code = 0x2212;

        this.value = code;
    },
	addTxt: function(txt)
	{
		var code = txt.charCodeAt(0);
        this.add(code);
	},
    getCode: function()
    {
        var code = this.value;

        var bCapitale = (code > 0x0040 && code < 0x005B),
            bSmall = (code > 0x0060 && code < 0x007b);

        if(this.type == TXT_ROMAN )
        {
            var bDigit = (code > 0x002F && code < 0x003A),
                bCapGreek = (code > 0x0390 && code < 0x03AA ),
                bSmallGreek = (code > 0x03B0 && code < 0x03CA);

            if(code == 0x0068) // h
                code = 0x210E;
            else if(bCapitale)
                code  = code + 0x1D3F3;
            else if(bSmall)
                code  = code + 0x1D3ED;
            else if(bCapGreek)
                code = code + 0x1D351;
            else if(bSmallGreek)
                code = code + 0x1D34B;

            if(code == 0x131) // "i" without dot
                code = 0x1D6A4;
            else if(code == 0x237) // "j" without dot
                code = 0x1D6A5;
        }
        else if(this.type == TXT_DOUBLE_STRUCK)
        {
            if(bCapitale)
                code  = code + 0x1D4F8;
            else if(bSmall)
                code  = code + 0x1D4F2;
        }
        else if(this.type == TXT_MONOSPACE)
        {
            if(bCapitale)
                code  = code + 0x1D630;
            else if(bSmall)
                code  = code + 0x1D62A;
        }
        else if(this.type == TXT_FRAKTUR)
        {
            if(bCapitale)
                code  = code + 0x1D4C4;
            else if(bSmall)
                code  = code + 0x1D4BE;
        }
        else if(this.type == TXT_SANS_SERIF)
        {
            if(bCapitale)
                code  = code + 0x1D5CB;
            else if(bSmall)
                code  = code + 0x1D5C5;
        }
        else if(this.type == TXT_SCRIPT)
        {
            if(bCapitale)
                code  = code + 0x1D45C;
            else if(bSmall)
                code  = code + 0x1D456;
        }

        return code;
    },
    getCodeChr: function()
    {
        return this.value;
    },
    fillPlaceholders: function()
    {
        this.typeObj = MATH_PLACEHOLDER;
        this.value = StartTextElement;
    },
    setLIterator: function(bIterator)
    {
        this.bIterator = bIterator; // символы другие , чуть толще
    },

    // ascent = Symbol.Ascent // = Placeholder.Ascent (= Placeholder.Height)
    // descent = FontAscent - Placeholder.Height (FontAscent = FontHeight - FontDescent)

    // ascent = FontDescent + Placeholder.Height
    // descent = Symbol.Descent ( = 0)

    // gap = FontHeight - FontDescent - Placeholder.Height + FontDescent
    old_old_recalculateSize: function()
    {
        /*var txtPrp = new CMathTextPrp();
        txtPrp.Merge(this.getTxtPrp());
        txtPrp.Italic = false;

        g_oTextMeasurer.SetFont( txtPrp );*/

        var letter = this.getCode();

        var metricsTxt = g_oTextMeasurer.Measure2Code(letter);
        var _width = metricsTxt.Width;

        //var _ascent = g_oTextMeasurer.GetHeight() + g_oTextMeasurer.GetDescender();
        //var _descent = (-1)*g_oTextMeasurer.GetDescender();

        var _ascent = metricsTxt.Ascent;
        var _descent = (metricsTxt.Height - metricsTxt.Ascent);
        var _height = _ascent + _descent;
        var widthG =  metricsTxt.WidthG;

        var _center = _ascent - 0.2487852283770651*g_oTextMeasurer.GetHeight(); // смещаем центр

        //var  _center = _ascent - 0.2798833819241982*g_oTextMeasurer.GetHeight(); // смещаем центр
        /*var font = GetMathFont(txtPrp);
         var placeholder = font.metrics.Placeholder;
         var  _cent = placeholder.Height*0.375;
         var HH = g_oTextMeasurer.GetHeight();*/

        this.size = {width: _width, widthG: widthG, height: _height, center: _center, ascent: _ascent, descent: _descent};
    },
    old_Resize: function(oMeasure)
    {
        var letter = this.getCode();

        var metricsTxt = oMeasure.Measure2Code(letter);
        var _width = metricsTxt.Width;

        var _ascent = metricsTxt.Ascent;
        var _descent = (metricsTxt.Height - metricsTxt.Ascent);
        var _height = _ascent + _descent;
        var widthG =  metricsTxt.WidthG;

        // TODO
        // убрать это смещение
        var _center = _ascent - 0.2487852283770651*oMeasure.GetHeight(); // смещаем центр


        this.size = {width: _width, widthG: widthG, height: _height, center: _center, ascent: _ascent, descent: _descent};
    },
    Resize: function(oMeasure)
    {

        //  смещения
        //  rasterOffsetX
        //  rasterOffsetY

        var letter = this.getCode();

        var metricsTxt = oMeasure.Measure2Code(letter);
        var width = metricsTxt.Width;

        var ascent  =  metricsTxt.Ascent;
        var descent = (metricsTxt.Height - metricsTxt.Ascent);
        var height  =  ascent + descent;

        var widthG   = metricsTxt.WidthG;

        width += this.GapLeft + this.GapRight;

        this.WidthVisible = width;

        this.size = {width: width, widthG: widthG, height: height, ascent: ascent};
    },
    old_draw: function()
    {
        var txtPrp = this.getTxtPrp();
        g_oTextMeasurer.SetFont( txtPrp );

        MathControl.pGraph.b_color1(0,0,0,255);
        MathControl.pGraph.SetFont(txtPrp);

        var X = this.pos.x ,
            Y = this.pos.y - this.size.center + this.size.ascent; // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine

        var invert = new CMatrix();
        invert.sx = this.transform.sx;
        invert.sy = this.transform.sy;
        invert.shx = this.transform.shx;
        invert.shy = this.transform.shy;
        invert.tx = 0;
        invert.ty = 0;
        invert.Invert();

        var xx = invert.TransformPointX(X, Y);
        var yy = invert.TransformPointY(X, Y);

        /*var invert1= new CMatrix();
        invert1.sx = this.transform.sx;
        invert1.sy = this.transform.sy;
        invert1.shx = this.transform.shx;
        invert1.shy = this.transform.shy;
        invert1.tx = 0;
        invert1.ty = 0;

        var xxx = invert1.TransformPointX(xx, yy);
        var yyy = invert1.TransformPointY(xx, yy);*/

        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;

        /*var tx = 0;
        var ty = 0;
        
        var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
        var y = (Y - x*shy - ty*shx)/sy;*/


        MathControl.pGraph.transform(sx, shy, shx, sy, 0, 0);
        MathControl.pGraph.FillTextCode(xx, yy , this.getCode());

    },
    draw: function(x, y, pGraphics)
    {
        /*var txtPrp = new CMathTextPrp();
        txtPrp.Merge(this.getTxtPrp());
        txtPrp.Italic = false;*/

        //pGraphics.b_color1(0,0,0,255);
        //pGraphics.SetFont(txtPrp);

        var X = this.pos.x + x,
            Y = this.pos.y + y;

        var invert = new CMatrix();
        invert.sx = this.transform.sx;
        invert.sy = this.transform.sy;
        invert.shx = this.transform.shx;
        invert.shy = this.transform.shy;
        invert.tx = 0;
        invert.ty = 0;
        invert.Invert();

        var xx = invert.TransformPointX(X, Y);
        var yy = invert.TransformPointY(X, Y);

        /*var invert1= new CMatrix();
         invert1.sx = this.transform.sx;
         invert1.sy = this.transform.sy;
         invert1.shx = this.transform.shx;
         invert1.shy = this.transform.shy;
         invert1.tx = 0;
         invert1.ty = 0;

         var xxx = invert1.TransformPointX(xx, yy);
         var yyy = invert1.TransformPointY(xx, yy);*/

        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;

        /*var tx = 0;
         var ty = 0;

         var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
         var y = (Y - x*shy - ty*shx)/sy;*/


        pGraphics.transform(sx, shy, shx, sy, 0, 0);
        pGraphics.FillTextCode(xx, yy , this.getCode());    //на отрисовку символа отправляем положение baseLine
		//pGraphics.FillTextCode(xx, yy , this.value);

    },
    setPosition: function(pos)
    {
        if( ! this.bJDraw)                      // for text
            this.pos = {x : pos.x + this.GapLeft, y: pos.y };
        else                                    // for symbol only drawing
            this.pos = {x:  pos.x + this.GapLeft, y: pos.y + this.size.ascent};
    },
    new_setPosition: function(pos)
    {
        this.pos = {x: pos.x , y: pos.y};
    },
    setCoeffTransform: function(sx, shx, shy, sy)
    {
        this.transform = {sx: sx, shx: shx, shy: shy, sy: sy};

        //здесь надо будет по-другому считать размер, после трансформации размер будет выставляться в g_oTextMeasurer
        //
        //MathControl.pGraph.transform(sx, shy, shx, sy, 0, 0);
        this.applyTransformation();

    },
    applyTransformation: function()
    {
        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;
        sy = (sy < 0) ? -sy : sy;

        this.size.width = this.size.width*sx + (-1)*this.size.width*shx;
        this.size.height = this.size.height*sy + this.size.height*shy;
        this.size.ascent = this.size.ascent*(sy + shy);
        this.size.descent = this.size.descent*(sy + shy);
        this.size.center = this.size.center*(sy + shy);

        /*this.size.width = this.size.width*this.transform.sx + (-1)*this.size.width*this.transform.shx;
        this.size.height = this.size.height*this.transform.sy + this.size.height*this.transform.shy;
        this.size.ascent = this.size.ascent*(this.transform.sy + this.transform.shy);
        this.size.descent = this.size.descent*(this.transform.sy + this.transform.shy);
        this.size.center = this.size.center*(this.transform.sy + this.transform.shy);*/

    },
    IsJustDraw: function()
    {
        return this.bJDraw;
    },
    relate: function(parent) // for symbol only drawing
    {
        this.Parent = parent;
    },
    IsIncline: function()
    {
        // возвращаем не Italic, т.к. могут быть мат. текст, но буквы без наклона (placeholder и т.п.)

        var bIncline = false;

        bIncline = bIncline || (this.value == 0x210E);
        bIncline = bIncline || (this.value == 0x1D6A4);
        bIncline = bIncline || (this.value == 0x1D6A5);

        bIncline = bIncline || (this.value > 0x0040 && this.value < 0x005B);
        bIncline = bIncline || (this.value > 0x0060 && this.value < 0x007b);

        return bIncline;
    },
    setJustDraw: function(bJustDraw)
    {
        this.bJDraw = bJustDraw;
    },
    setMText: function(type)
    {
        this.type = type;
    },
    // заглушка для текста (для n-арных операторов, когда выставляется текст вместо оператора)
    setComposition: function() // заглушка
    {},
    setReferenceComposition: function() // заглушка
    {},
    Write_ToBinary: function()
    {}

    /*draw2: function()
     {
     MathControl.pGraph.b_color1(0,0,0,255);
     MathControl.pGraph.SetFont(this.font);

     var sx = this.transform.sx, shx = this.transform.shx,
     shy = this.transform.shy, sy = this.transform.sy;
     var X = this.pos.x,
     Y = this.pos.y - this.size.center + this.size.ascent;

     var tx = 0;
     var ty = 0;

     var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
     var y = (Y - x*shy - ty*shx)/sy;

     MathControl.pGraph.transform(sx, shy, shx, sy, tx, ty);
     MathControl.pGraph.FillTextCode(x, y , this.value); // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine
     },*/
    /*getMetrics: function()
     {
     return g_oTextMeasurer.Measure2Code(this.value);
     },*/
    /*IsHighElement: function()
     {
     g_oTextMeasurer.SetFont(this.font);
     return (this.size.ascent - 0.001 > g_oTextMeasurer.Measure2Code(0x1D44E).Ascent) ;
     },*/
    /*trasformByDimensions: function(width, height, restrW, restrH)
     {
     //если restrict == 0 => ограничений нет
     var restrictW = (restrW > 0 && restrW < 90) ?  restrW : 90;
     var restrictH = (restrH > 0 && restrH < 90) ?  restrH : 90;

     var sx = width/this.size.width,
     sy = height/this.size.height,
     shx = this.transform.shx,
     shy = this.transform.shy;

     sx = (sx > restrictW) ? restrictW : sx;
     sy = (sy > restrictH) ? restrictH : sy;

     this.setCoeffTransform(sx, shx, shy, sy);
     },
     transformByWidth: function(width, restrict, restrict0)
     {
     var restr0 = (restrict0 > 0) ? restrict0 : 0;
     var restr = ( restrict > 0 && restrict < 90) ? restrict : 90;
     restr = (restr < restr0) ? restr0 : restr;

     var sx = width/this.size.width,
     sy = this.transform.sy,
     shx = this.transform.shx,
     shy = this.transform.shy;

     sx = (sx > restr) ? restr : sx;

     this.setCoeffTransform(sx, shx, shy, sy);
     },
     trasformByHeight: function(height, restrict, restrict0)
     {
     var restr0 = (restrict0 > 0) ? restrict0 : 0;
     var restr = ( restrict > 0 && restrict < 90) ? restrict : 90;
     restr = (restr < restr0) ? restr0 : restr;

     var sx =  this.transform.sx,
     sy = height/this.size.height,
     shx = this.transform.shx,
     shy = this.transform.shy;

     sy = (sy > restr) ? restr : sy;

     this.setCoeffTransform(sx, shx, shy, sy);
     },
     transformLength: function(height)
     {
     var sx =  height/this.size.height,
     sy = height/this.size.height,
     shx = this.transform.shx,
     shy = this.transform.shy;

     this.setCoeffTransform(sx, shx, shy, sy);
     },*/
    /*IsIncline: function()
     {
     var flag = false;

     if(this.value >= 0x1D434 && this.value <= 0x1D44D ) // capitale
     flag = true;
     else if(this.value >= 0x1D44E && this.value <= 0x1D467) //small
     flag = true;
     else if(this.value == 0x1D6A4 || this.value == 0x1D6A5)// i & j without dot
     flag = true;

     return flag;
     },*/

}


function old_CMathText(params)
{
    this.pos = null;
    this.size = null;
    this.sizeSymbol = null;

    //this.value = val;
    this.font = { FontFamily: params.font.FontFamily,  FontSize : params.font.FontSize };
    this.metrics = params.font.metrics;
    this.indefSize = params.indefSize;

    this.bMText = params.bMText ? true : false;

    this.transform =
    {
        sx:  1,
        shy: 0,
        shx: 0,
        sy:  1
    };

}
//TODO
//переделать индефикатор размера перетащить в инициализацию
old_CMathText.prototype =
{
    init: function(code)
    {
        this.add(code);

        //MathControl.pGraph.transform(1, 0, 0, 1, 0, 0);
        this.setIndefSize(this.indefSize);
    },
    recalculateSize_2: function()
    {
        g_oTextMeasurer.SetFont(this.font);

        var metricsTxt = g_oTextMeasurer.Measure2Code(this.value);
        var _width = metricsTxt.Width;

        //var _ascent = g_oTextMeasurer.GetHeight() + g_oTextMeasurer.GetDescender();
        //var _descent = (-1)*g_oTextMeasurer.GetDescender();

        var _ascent = metricsTxt.Ascent;
        var _descent = (metricsTxt.Height - metricsTxt.Ascent);
        var _height = _ascent + _descent;
        var placeholder = this.metrics.Placeholder;
        var  _center = _ascent - placeholder.Height*DIV_CENTER;

        this.sizeSymbol = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent};
        this.size = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent, gap: 0 };
    },
    recalculateSize_1: function()
    {
        var FontHeight =  this.metrics.Height;
        var FontDescent = this.metrics.Descender;

        g_oTextMeasurer.SetFont(this.font);
        var metricsTxt = g_oTextMeasurer.Measure2Code(this.value);
        var _width = metricsTxt.Width;
        var _ascent = metricsTxt.Ascent;
        var placeholder = this.metrics.Placeholder;
        var  _center = _ascent - placeholder.Height/2;

        //var _descent = FontHeight - FontDescent - placeholder.Height;
        var _descent = FontHeight - placeholder.Height;
        var _height = _ascent + _descent;

        this.sizeSymbol = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent};
        this.size = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent, gap: 0 };
    },

    // ascent = Symbol.Ascent // = Placeholder.Ascent (= Placeholder.Height)
    // descent = FontAscent - Placeholder.Height (FontAscent = FontHeight - FontDescent)

    // ascent = FontDescent + Placeholder.Height
    // descent = Symbol.Descent ( = 0)

    // gap = FontHeight - FontDescent - Placeholder.Height + FontDescent

    recalculateSize_3: function()
    {
        var FontHeight =  this.metrics.Height;
        var FontDescent = this.metrics.Descender;

        g_oTextMeasurer.SetFont(this.font);
        var metricsTxt = g_oTextMeasurer.Measure2Code(this.value);
        var TxtDescent = metricsTxt.Height - metricsTxt.Ascent;

        var _width = metricsTxt.Width;
        var placeholder = this.metrics.Placeholder;

        var _descent = TxtDescent;
        //var _ascent = FontHeight - FontDescent;
        var _ascent = FontDescent + placeholder.Height;
        var _height = _descent + _ascent;

        var  _center = _ascent - placeholder.Height/2;

        this.sizeSymbol = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent};
        this.size = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent, gap: 0 };
    },
    recalculateSize_4: function()
    {
        g_oTextMeasurer.SetFont(this.font);

        var metricsTxt = g_oTextMeasurer.Measure2Code(this.value);
        //    ??!!
        var gap = metricsTxt.Ascent - g_oTextMeasurer.Measure2Code(0x1D44E).Ascent - metricsTxt.Height;
        gap = gap < g_dKoef_pt_to_mm  ? g_dKoef_pt_to_mm  : gap;
        //

        var _width = metricsTxt.WidthG;
        var _height = metricsTxt.Height + gap;
        var _ascent = metricsTxt.Ascent;
        //var _ascent = _height/2;
        var _descent = _height/2;
        var _center = _height/2;

        this.sizeSymbol = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent};
        this.size = {width: _width, height: _height, center: _center, ascent: _ascent, descent: _descent, gap: 0 };
    },
    old_draw: function()
    {
        MathControl.pGraph.b_color1(0,0,0,255);
        MathControl.pGraph.SetFont(this.font);

        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;
        var X = this.pos.x,
            Y = this.pos.y - this.size.center + this.size.ascent;

        var tx = X*(1 - sx) - Y*shx;
        var ty = Y*(1 - sy) - X*shy;

        MathControl.pGraph.transform(sx, shy, shx, sy, tx, ty);
        MathControl.pGraph.FillTextCode(X, Y , this.value); // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine

        //var tx = 0;
        //var ty = 0;

        //var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
        //var y = (Y - x*shy - ty*shx)/sy;

        //MathControl.pGraph.transform(sx, shy, shx, sy, tx, ty);
        //MathControl.pGraph.FillTextCode(x, y , this.value); // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine
    },
    old_old_draw: function()
    {
        MathControl.pGraph.b_color1(0,0,0,255);
        MathControl.pGraph.SetFont(this.font);

        var X = this.pos.x ,
            Y = this.pos.y - this.size.center + this.size.ascent; // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine

        var invert = new CMatrix();
        invert.sx = this.transform.sx;
        invert.sy = this.transform.sy;
        invert.shx = this.transform.shx;
        invert.shy = this.transform.shy;
        invert.tx = 0;
        invert.ty = 0;
        invert.Invert();

        var xx = invert.TransformPointX(X, Y);
        var yy = invert.TransformPointY(X, Y);

        /*var invert1= new CMatrix();
         invert1.sx = this.transform.sx;
         invert1.sy = this.transform.sy;
         invert1.shx = this.transform.shx;
         invert1.shy = this.transform.shy;
         invert1.tx = 0;
         invert1.ty = 0;

         var xxx = invert1.TransformPointX(xx, yy);
         var yyy = invert1.TransformPointY(xx, yy);*/

        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;

        var tx = 0;
        var ty = 0;

        /*var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
         var y = (Y - x*shy - ty*shx)/sy;*/

        MathControl.pGraph.transform(sx, shy, shx, sy, 0, 0);
        MathControl.pGraph.FillTextCode(xx, yy , this.value);

    },
    draw: function()
    {
        var txtPrp = this.getTxtPrp();
        g_oTextMeasurer.SetFont ( txtPrp );

        MathControl.pGraph.b_color1(0,0,0,255);
        MathControl.pGraph.SetFont(txtPrp);

        var X = this.pos.x ,
            Y = this.pos.y; // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine

        var invert = new CMatrix();
        invert.sx = this.transform.sx;
        invert.sy = this.transform.sy;
        invert.shx = this.transform.shx;
        invert.shy = this.transform.shy;
        invert.tx = 0;
        invert.ty = 0;
        invert.Invert();

        var xx = invert.TransformPointX(X, Y);
        var yy = invert.TransformPointY(X, Y);

        /*var invert1= new CMatrix();
         invert1.sx = this.transform.sx;
         invert1.sy = this.transform.sy;
         invert1.shx = this.transform.shx;
         invert1.shy = this.transform.shy;
         invert1.tx = 0;
         invert1.ty = 0;

         var xxx = invert1.TransformPointX(xx, yy);
         var yyy = invert1.TransformPointY(xx, yy);*/

        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;

        /*var tx = 0;
         var ty = 0;

         var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
         var y = (Y - x*shy - ty*shx)/sy;*/


        MathControl.pGraph.transform(sx, shy, shx, sy, 0, 0);
        MathControl.pGraph.FillTextCode(xx, yy , this.getCode() );

    },
    draw2: function()
    {
        MathControl.pGraph.b_color1(0,0,0,255);
        MathControl.pGraph.SetFont(this.font);

        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;
        var X = this.pos.x,
            Y = this.pos.y - this.size.center + this.size.ascent;

        var tx = 0;
        var ty = 0;

        var x = (X*sy  - Y*shx - tx*sy)/(sx*sy- shy*shx);
        var y = (Y - x*shy - ty*shx)/sy;

        MathControl.pGraph.transform(sx, shy, shx, sy, tx, ty);
        MathControl.pGraph.FillTextCode(x, y , this.value); // прибавляем аскент, тк на отрисовку символа отправляем положение baseLine
    },
    getMetrics: function()
    {
        return g_oTextMeasurer.Measure2Code(this.value);
    },
    setFont: function(font)
    {
        this.font = font;
        this.recalculateSize();
    },
    old_setPosition: function( _pos )
    {
        /*if(this.value == 0x307)
         this.pos = {x : _pos.x + this.size.width, y: _pos.y };
         else
         this.pos = {x : _pos.x, y: _pos.y };
         */

        this.pos = {x : _pos.x, y: _pos.y };
    },
    setPosition: function( pos )
    {
        if( ! this.bJDraw)                      // for text
            this.pos = {x : pos.x, y: pos.y };
        else                                    // for symbol only drawing
            this.pos = {x: pos.x , y: pos.y + this.size.center};
    },
    setIndefSize: function(indef)
    {
        if(indef == indef - 0 && indef > 0 && indef < 5)
        {
            switch( indef )
            {
                case SizeOrdinary:
                    this.recalculateSize = this.recalculateSize_1;
                    break;
                case SizeDefault:
                    this.recalculateSize = this.recalculateSize_2;
                    break;
                case SizeDenominator:
                    this.recalculateSize = this.recalculateSize_3;
                    break;
                case SizeDiacritic:
                    this.recalculateSize = this.recalculateSize_4;
                    break;
            }
        }
        else
            this.recalculateSize = this.recalculateSize_2;

        this.recalculateSize();
    },
    setCoeffTransform: function(sx, shx, shy, sy)
    {
        this.transform = {sx: sx, shx: shx, shy: shy, sy: sy};

        //здесь надо будет по-другому считать размер, после трансформации размер будет выставляться в g_oTextMeasurer
        //
        //MathControl.pGraph.transform(sx, shy, shx, sy, 0, 0);
        this.applyTransformation();

    },
    applyTransformation: function()
    {
        var sx = this.transform.sx, shx = this.transform.shx,
            shy = this.transform.shy, sy = this.transform.sy;
        sy = (sy < 0) ? -sy : sy;

        this.size.width = this.sizeSymbol.width*sx + (-1)*this.sizeSymbol.width*shx;
        this.size.height = this.sizeSymbol.height*sy + this.sizeSymbol.height*shy;
        this.size.ascent = this.sizeSymbol.ascent*(sy + shy);
        this.size.descent = this.sizeSymbol.descent*(sy + shy);
        this.size.center = this.sizeSymbol.center*(sy + shy);

        /*this.size.width = this.size.width*this.transform.sx + (-1)*this.size.width*this.transform.shx;
         this.size.height = this.size.height*this.transform.sy + this.size.height*this.transform.shy;
         this.size.ascent = this.size.ascent*(this.transform.sy + this.transform.shy);
         this.size.descent = this.size.descent*(this.transform.sy + this.transform.shy);
         this.size.center = this.size.center*(this.transform.sy + this.transform.shy);*/

    },
    IsHighElement: function()
    {
        g_oTextMeasurer.SetFont(this.font);
        return (this.size.ascent - 0.001 > g_oTextMeasurer.Measure2Code(0x1D44E).Ascent) ;
    },
    trasformByDimensions: function(width, height, restrW, restrH)
    {
        //если restrict == 0 => ограничений нет
        var restrictW = (restrW > 0 && restrW < 90) ?  restrW : 90;
        var restrictH = (restrH > 0 && restrH < 90) ?  restrH : 90;

        var sx = width/this.sizeSymbol.width,
            sy = height/this.sizeSymbol.height,
            shx = this.transform.shx,
            shy = this.transform.shy;

        sx = (sx > restrictW) ? restrictW : sx;
        sy = (sy > restrictH) ? restrictH : sy;

        this.setCoeffTransform(sx, shx, shy, sy);
    },
    transformByWidth: function(width, restrict, restrict0)
    {
        var restr0 = (restrict0 > 0) ? restrict0 : 0;
        var restr = ( restrict > 0 && restrict < 90) ? restrict : 90;
        restr = (restr < restr0) ? restr0 : restr;

        var sx = width/this.sizeSymbol.width,
            sy = this.transform.sy,
            shx = this.transform.shx,
            shy = this.transform.shy;

        sx = (sx > restr) ? restr : sx;

        this.setCoeffTransform(sx, shx, shy, sy);
    },
    trasformByHeight: function(height, restrict, restrict0)
    {
        var restr0 = (restrict0 > 0) ? restrict0 : 0;
        var restr = ( restrict > 0 && restrict < 90) ? restrict : 90;
        restr = (restr < restr0) ? restr0 : restr;

        var sx =  this.transform.sx,
            sy = height/this.sizeSymbol.height,
            shx = this.transform.shx,
            shy = this.transform.shy;

        sy = (sy > restr) ? restr : sy;

        this.setCoeffTransform(sx, shx, shy, sy);
    },
    transformLength: function(height)
    {
        var sx =  height/this.sizeSymbol.height,
            sy = height/this.sizeSymbol.height,
            shx = this.transform.shx,
            shy = this.transform.shy;

        this.setCoeffTransform(sx, shx, shy, sy);
    },
    add: function(code)
    {
        if(this.bMText)
        {
            if(code == 0x0068) // h
                code = 0x210E;

            var bCapitale = (code > 0x0040 && code < 0x005B),
                bSmall = (code > 0x0060 && code < 0x007b),
                bDigit = (code > 0x002F && code < 0x003A),
                bCapGreek = (code > 0x0390 && code < 0x03AA ),
                bSmallGreek = (code > 0x03B0 && code < 0x03CA);

            if(bCapitale)
                code  = code + 0x1D3F3;
            else if(bSmall)
                code  = code + 0x1D3ED;
            else if(bCapGreek)
                code = code + 0x1D351;
            else if(bSmallGreek)
                code = code + 0x1D34B;

            if(code == 0x131) // "i" without dot
                code = 0x1D6A4;
            else if(code == 0x237) // "j" without dot
                code = 0x1D6A5;

        }
        else
        {
            if(code == 0x210E) // h
                code = 0x0068;

            var bCapitale = (code >= 0x1D434 && code <= 0x1D44D),
                bSmall = (code >= 0x1D44E && code <= 0x1D467);

            if(bCapitale)
                code  = code - 0x1D3F3;
            else if(bSmall)
                code  = code - 0x1D3ED;
            else if(bCapGreek)
                code = code - 0x1D351;
            else if(bSmallGreek)
                code = code - 0x1D34B;

            if(code == 0x1D6A4) // "i" without dot
                code = 0x131;
            else if(code == 0x1D6A5) // "j" without dot
                code = 0x237;

        }

        this.value = code;
    },
    IsIncline: function()
    {

    },
    /*IsIncline: function()
    {
        var flag = false;

        if(this.value >= 0x1D434 && this.value <= 0x1D44D ) // capitale
            flag = true;
        else if(this.value >= 0x1D44E && this.value <= 0x1D467) //small
            flag = true;
        else if(this.value == 0x1D6A4 || this.value == 0x1D6A5)// i & j without dot
            flag = true;

        return flag;
    },*/
    ResizeDirect: function()
    {
        this.recalculateSize();
    }

}