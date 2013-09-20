/**
 * Created with JetBrains WebStorm.
 * User: Sergey.Luzyanin
 * Date: 6/28/13
 * Time: 11:18 AM
 * To change this template use File | Settings | File Templates.
 */
function NewShapeTrack(drawingObjects, presetGeom, startX, startY)
{
    this.drawingObjects = drawingObjects;
    this.presetGeom = presetGeom;
    this.startX = startX;
    this.startY = startY;

    this.x = null;
    this.y = null;
    this.extX = null;
    this.extY = null;

    this.transform = new CMatrix();
    var geometry = CreateGeometry(presetGeom !== "textRect" ? presetGeom : "rect");
    geometry.Init(5, 5);

    var theme = drawingObjects.Layout.Master.Theme;

    var style;
    if(presetGeom !== "textRect")
        style = CreateDefaultShapeStyle();
    else
        style = CreateDefaultTextRectStyle();
    var brush = theme.getFillStyle(style.fillRef.idx);
    style.fillRef.Color.Calculate(theme, drawingObjects, drawingObjects.Layout, drawingObjects.Layout.Master, {R:0, G: 0, B:0, A:255});
    var RGBA = style.fillRef.Color.RGBA;

    if (style.fillRef.Color.color != null)
    {
        if (brush.fill != null && (brush.fill.type == FILL_TYPE_SOLID || brush.fill.type == FILL_TYPE_GRAD))
        {
            brush.fill.color = style.fillRef.Color.createDuplicate();
        }
    }



    var pen = theme.getLnStyle(style.lnRef.idx);
    style.lnRef.Color.Calculate(theme, drawingObjects, drawingObjects.Layout, drawingObjects.Layout.Master);
    RGBA = style.lnRef.Color.RGBA;

    if(presetGeom === "textRect")
    {
        var ln, fill;
        ln = new CLn();
        ln.w = 6350;
        ln.Fill = new CUniFill();
        ln.Fill.fill = new CSolidFill();
        ln.Fill.fill.color = new CUniColor();
        ln.Fill.fill.color.color  = new CPrstColor();
        ln.Fill.fill.color.color.id = "black";

        fill = new CUniFill();
        fill.fill = new CSolidFill();
        fill.fill.color = new CUniColor();
        fill.fill.color.color  = new CSchemeColor();
        fill.fill.color.color.id = 12;
        pen.merge(ln);
        brush.merge(fill);
    }

    pen.Fill.calculate(theme, drawingObjects, drawingObjects.Layout, drawingObjects.Layout.Master, RGBA);
    brush.calculate(theme, drawingObjects, drawingObjects.Layout, drawingObjects.Layout.Master, RGBA);


    this.overlayObject = new OverlayObject(geometry, 5, 5, brush, pen, this.transform);
    this.shape = null;
    this.track = function(e, x, y)
    {
        var real_dist_x = x - this.startX;
        var abs_dist_x = Math.abs(real_dist_x);
        var real_dist_y = y - this.startY;
        var abs_dist_y = Math.abs(real_dist_y);

        if(!(e.CtrlKey || e.ShiftKey))
        {
            if(real_dist_x >= 0)
            {
                this.x = this.startX;
            }
            else
            {
                this.x = abs_dist_x >= MIN_SHAPE_SIZE  ? x : this.startX - MIN_SHAPE_SIZE;
            }

            if(real_dist_y >= 0)
            {
                this.y = this.startY;
            }
            else
            {
                this.y = abs_dist_y >= MIN_SHAPE_SIZE  ? y : this.startY - MIN_SHAPE_SIZE;
            }

            this.extX = abs_dist_x >= MIN_SHAPE_SIZE ? abs_dist_x : MIN_SHAPE_SIZE;
            this.extY = abs_dist_y >= MIN_SHAPE_SIZE ? abs_dist_y : MIN_SHAPE_SIZE;

        }
        else if(e.CtrlKey && !e.ShiftKey)
        {
            if(abs_dist_x >= MIN_SHAPE_SIZE_DIV2)
            {
                this.x = this.startX - abs_dist_x;
                this.extX = 2*abs_dist_x;
            }
            else
            {
                this.x = this.startX - MIN_SHAPE_SIZE_DIV2;
                this.extX = MIN_SHAPE_SIZE;
            }

            if(abs_dist_y >= MIN_SHAPE_SIZE_DIV2)
            {
                this.y = this.startY - abs_dist_y;
                this.extY = 2*abs_dist_y;
            }
            else
            {
                this.y = this.startY - MIN_SHAPE_SIZE_DIV2;
                this.extY = MIN_SHAPE_SIZE;
            }
        }
        else if(!e.CtrlKey && e.ShiftKey)
        {
            var new_width, new_height;
            var prop_coefficient = (typeof SHAPE_ASPECTS[this.presetGeom] === "number" ? SHAPE_ASPECTS[this.presetGeom] : 1);
            if(abs_dist_y === 0)
            {
                new_width = abs_dist_x > MIN_SHAPE_SIZE ? abs_dist_x : MIN_SHAPE_SIZE;
                new_height = abs_dist_x/prop_coefficient;
            }
            else
            {
                var new_aspect = abs_dist_x/abs_dist_y;
                if (new_aspect >= prop_coefficient)
                {
                    new_width = abs_dist_x;
                    new_height = abs_dist_x/prop_coefficient;
                }
                else
                {
                    new_height = abs_dist_y;
                    new_width = abs_dist_y*prop_coefficient;
                }
            }

            if(new_width < MIN_SHAPE_SIZE || new_height < MIN_SHAPE_SIZE)
            {
                var k_wh = new_width/new_height;
                if(new_height < MIN_SHAPE_SIZE && new_width < MIN_SHAPE_SIZE)
                {
                    if(new_height < new_width)
                    {
                        new_height = MIN_SHAPE_SIZE;
                        new_width = new_height*k_wh;
                    }
                    else
                    {
                        new_width = MIN_SHAPE_SIZE;
                        new_height = new_width/k_wh;
                    }
                }
                else if(new_height < MIN_SHAPE_SIZE)
                {
                    new_height = MIN_SHAPE_SIZE;
                    new_width = new_height*k_wh;
                }
                else
                {
                    new_width = MIN_SHAPE_SIZE;
                    new_height = new_width/k_wh;
                }
            }
            this.extX = new_width;
            this.extY = new_height;
            if(real_dist_x >= 0)
                this.x = this.startX;
            else
                this.x = this.startX - this.extX;

            if(real_dist_y >= 0)
                this.y = this.startY;
            else
                this.y = this.startY - this.extY;
        }
        else
        {
            var new_width, new_height;
            var prop_coefficient = (typeof SHAPE_ASPECTS[this.presetGeom] === "number" ? SHAPE_ASPECTS[this.presetGeom] : 1);
            if(abs_dist_y === 0)
            {
                new_width = abs_dist_x > MIN_SHAPE_SIZE_DIV2 ? abs_dist_x*2 : MIN_SHAPE_SIZE;
                new_height = new_width/prop_coefficient;
            }
            else
            {
                var new_aspect = abs_dist_x/abs_dist_y;
                if (new_aspect >= prop_coefficient)
                {
                    new_width = abs_dist_x*2;
                    new_height = new_width/prop_coefficient;
                }
                else
                {
                    new_height = abs_dist_y*2;
                    new_width = new_height*prop_coefficient;
                }
            }

            if(new_width < MIN_SHAPE_SIZE || new_height < MIN_SHAPE_SIZE)
            {
                var k_wh = new_width/new_height;
                if(new_height < MIN_SHAPE_SIZE && new_width < MIN_SHAPE_SIZE)
                {
                    if(new_height < new_width)
                    {
                        new_height = MIN_SHAPE_SIZE;
                        new_width = new_height*k_wh;
                    }
                    else
                    {
                        new_width = MIN_SHAPE_SIZE;
                        new_height = new_width/k_wh;
                    }
                }
                else if(new_height < MIN_SHAPE_SIZE)
                {
                    new_height = MIN_SHAPE_SIZE;
                    new_width = new_height*k_wh;
                }
                else
                {
                    new_width = MIN_SHAPE_SIZE;
                    new_height = new_width/k_wh;
                }
            }
            this.extX = new_width;
            this.extY = new_height;
            this.x = this.startX - this.extX*0.5;
            this.y = this.startY - this.extY*0.5;
        }
        this.overlayObject.updateExtents(this.extX, this.extY);
        this.transform.Reset();
        global_MatrixTransformer.TranslateAppend(this.transform, this.x, this.y);
    };

    this.ctrlDown = function()
    {};

    this.shiftDown = function()
    {};

    this.draw = function(overlay)
    {
        this.overlayObject.draw(overlay);
    };

    this.trackEnd = function()
    {
        var shape = new CShape(null, this.drawingObjects);
        shape.setParent(drawingObjects);
        if(this.presetGeom !== "textRect")
            shape.initDefault(this.x, this.y, this.extX, this.extY, false, false, this.presetGeom);
        else
            shape.initDefaultTextRect(this.x, this.y, this.extX, this.extY, false, false);
        shape.select(this.drawingObjects.graphicObjects);
        drawingObjects.shapeAdd(drawingObjects.cSld.spTree.length, shape);
        this.drawingObjects.graphicObjects.State.resultObject = shape;
    };
}