class ClearMaskPass {
  constructor() {
    this.enabled = true;
  }

  render ( renderer, writeBuffer, readBuffer, delta ) {

      var context = renderer.context;

      context.disable( context.STENCIL_TEST );

  }
}

export default ClearMaskPass;
